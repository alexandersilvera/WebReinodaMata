/**
 * Cloud Functions para gestión de eventos
 */

import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { isValidEmail, getSiteUrlConfig } from "../../config/mailgun.js";
import { sendEmail } from "../../shared/emailService.js";
import * as admin from "firebase-admin"; // Mantener esta importación para FieldValue
import { db } from '../../index.js'; // Importar la instancia de db desde index.ts

/**
 * Función para cancelar un registro de evento
 * Uso: Puede ser llamada por el usuario autenticado o por un admin
 */
export const cancelEventRegistration = onCall(
  {
    region: "southamerica-east1",
  },
  async (request) => {
    // Verificar que el usuario esté autenticado
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "Debes estar autenticado para cancelar un registro"
      );
    }

    const { registrationId, eventId, userId, reason } = request.data;

    logger.info("Cancelando registro", {
      registrationId,
      eventId,
      userId,
      requestUserId: request.auth.uid,
    });

    try {
      // const db = admin.firestore(); // Eliminado
      // Si se proporciona registrationId, usar directamente
      if (registrationId) {
        const regRef = admin.firestore().collection("event_registrations").doc(registrationId);
        const regDoc = await regRef.get();

        if (!regDoc.exists) {
          throw new HttpsError("not-found", "Registro no encontrado");
        }

        const regData = regDoc.data();

        // Verificar que el usuario puede cancelar este registro
        // (debe ser el dueño del registro o un admin)
        if (
          regData?.userId !== request.auth.uid &&
          !request.auth.token.email?.includes("admin")
        ) {
          throw new HttpsError(
            "permission-denied",
            "No tienes permiso para cancelar este registro"
          );
        }

        // Cancelar el registro
        await regRef.update({
          status: "cancelled",
          cancellationDate: admin.firestore.FieldValue.serverTimestamp(),
          cancellationReason:
            reason || "Cancelado por usuario - Registro incompleto",
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Decrementar contador de participantes
        if (regData?.eventId) {
          const eventRef = admin.firestore().collection("academic_events").doc(regData.eventId);
          await eventRef.update({
            currentParticipants: admin.firestore.FieldValue.increment(-1),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }

        logger.info("Registro cancelado exitosamente", { registrationId });

        return {
          success: true,
          message: "Registro cancelado exitosamente",
          registrationId,
        };
      }

      // Si no hay registrationId, buscar por userId y eventId
      if (!userId || !eventId) {
        throw new HttpsError(
          "invalid-argument",
          "Debes proporcionar registrationId o userId+eventId"
        );
      }

      // Verificar que el usuario puede buscar este registro
      if (
        userId !== request.auth.uid &&
        !request.auth.token.email?.includes("admin")
      ) {
        throw new HttpsError(
          "permission-denied",
          "No tienes permiso para cancelar este registro"
        );
      }

      // Buscar el registro
      const querySnapshot = await admin.firestore()
        .collection("event_registrations")
        .where("userId", "==", userId)
        .where("eventId", "==", eventId)
        .get();

      if (querySnapshot.empty) {
        throw new HttpsError("not-found", "No se encontró ningún registro");
      }

      const regDoc = querySnapshot.docs[0];
      const regData = regDoc.data();

      logger.info("Registro encontrado", {
        id: regDoc.id,
        status: regData.status,
      });

      // Verificar si ya está cancelado
      if (regData.status === "cancelled") {
        return {
          success: true,
          message: "El registro ya estaba cancelado",
          registrationId: regDoc.id,
          alreadyCancelled: true,
        };
      }

      // Cancelar el registro
      await regDoc.ref.update({
        status: "cancelled",
        cancellationDate: admin.firestore.FieldValue.serverTimestamp(),
        cancellationReason:
          reason || "Cancelado por usuario - Registro incompleto",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Decrementar contador de participantes
      const eventRef = db.collection("academic_events").doc(eventId);
      await eventRef.update({
        currentParticipants: admin.firestore.FieldValue.increment(-1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      logger.info("Registro cancelado exitosamente", { id: regDoc.id });

      return {
        success: true,
        message: "Registro cancelado exitosamente. Puedes registrarte nuevamente.",
        registrationId: regDoc.id,
      };
    } catch (error: any) {
      logger.error("Error al cancelar registro", error);

      if (error instanceof HttpsError) {
        throw error;
      }

      throw new HttpsError(
        "internal",
        `Error al cancelar el registro: ${error.message}`
      );
    }
  }
);

/**
 * Función que se ejecuta cuando se crea una nueva inscripción a evento
 * Envía un correo de confirmación al participante
 */
export const sendEventRegistrationConfirmation = onDocumentCreated(
  {
    document: "event_registrations/{registrationId}",
    memory: "256MiB",
    region: "southamerica-east1" // <--- AÑADE ESTA LÍNEA
  },
  async (event) => {
    try {
      const registrationData = event.data?.data();
      if (!registrationData) {
        console.error("No se encontraron datos de la inscripción");
        return;
      }

      const {
        userEmail,
        userName,
        eventId,
        eventTitle,
        status,
        paymentRequired
      } = registrationData;

      if (!userEmail || !isValidEmail(userEmail)) {
        console.error("Email inválido o faltante en la inscripción");
        return;
      }

      console.log(`Enviando confirmación de inscripción a: ${userEmail} para evento: ${eventTitle}`);

      // Obtener detalles del evento desde Firestore
      let eventDetails: any = null;
      try {
        const eventDoc = await admin.firestore().collection("academic_events").doc(eventId).get();
        if (eventDoc.exists) {
          eventDetails = eventDoc.data();
        }
      } catch (error) {
        console.error("Error obteniendo detalles del evento:", error);
      }

      const siteUrlConfig = getSiteUrlConfig();

      // Construir URL del evento
      const eventUrl = `${siteUrlConfig.url}/eventos/${eventId}`;
      const myEventsUrl = `${siteUrlConfig.url}/mi-cuenta/mis-eventos`;

      // Formatear fecha si está disponible
      let formattedDate = "Fecha por confirmar";
      if (eventDetails && eventDetails.date) {
        try {
          const eventDate = eventDetails.date.seconds
            ? new Date(eventDetails.date.seconds * 1000)
            : new Date(eventDetails.date);
          formattedDate = eventDate.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
        } catch (dateError) {
          console.error("Error formateando fecha:", dateError);
        }
      }

      // Determinar el asunto y contenido según el estado
      let subject = "";
      let textContent = "";
      let htmlContent = "";

      if (paymentRequired && status === 'registered') {
        // Inscripción pendiente de pago
        subject = `Confirma tu inscripción: ${eventTitle}`;
        textContent = `
¡Hola ${userName}!

Recibimos tu solicitud de inscripción para el evento:

"${eventTitle}"

📅 Fecha: ${formattedDate}
${eventDetails?.location ? `📍 Ubicación: ${eventDetails.location}` : ''}
${eventDetails?.duration ? `⏱️ Duración: ${eventDetails.duration} horas` : ''}

Para completar tu inscripción, debes realizar el pago.

Una vez confirmado el pago, recibirás un correo con todos los detalles del evento.

Ver detalles del evento: ${eventUrl}
Ver mis inscripciones: ${myEventsUrl}

Si tienes alguna pregunta, no dudes en contactarnos.

¡Axé!

Centro Umbandista Reino Da Mata
        `.trim();

        htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmación de inscripción</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td style="padding: 20px 0;">
                <table style="width: 600px; max-width: 100%; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="background-color: #2d5016; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                            <h1 style="margin: 0; font-size: 24px;">Centro Umbandista Reino Da Mata</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 30px;">
                            <h2 style="color: #2d5016; margin-bottom: 20px;">¡Hola ${userName}!</h2>
                            <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                                Recibimos tu solicitud de inscripción para el evento:
                            </p>
                            <div style="background-color: #f8f8f8; padding: 20px; border-left: 4px solid #4a7c2a; margin: 20px 0;">
                                <h3 style="color: #2d5016; margin: 0 0 15px 0;">${eventTitle}</h3>
                                <p style="color: #666; margin: 5px 0;">📅 <strong>Fecha:</strong> ${formattedDate}</p>
                                ${eventDetails?.location ? `<p style="color: #666; margin: 5px 0;">📍 <strong>Ubicación:</strong> ${eventDetails.location}</p>` : ''}
                                ${eventDetails?.duration ? `<p style="color: #666; margin: 5px 0;">⏱️ <strong>Duración:</strong> ${eventDetails.duration} horas</p>` : ''}
                            </div>
                            <div style="background-color: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                <p style="color: #856404; margin: 0; font-size: 14px;">
                                    ⚠️ <strong>Inscripción pendiente de pago</strong><br>
                                    Para completar tu inscripción, debes realizar el pago. Una vez confirmado, recibirás un correo con todos los detalles.
                                </p>
                            </div>
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${eventUrl}" style="display: inline-block; background: linear-gradient(135deg, #4a7c2a 0%, #2d5016 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 6px; font-weight: 600; font-size: 16px;">Ver detalles del evento</a>
                            </div>
                            <p style="color: #666; font-size: 14px; line-height: 1.6; margin-top: 20px;">
                                Si tienes alguna pregunta, no dudes en contactarnos.
                            </p>
                            <p style="color: #2d5016; font-weight: 600; margin-top: 30px;">¡Axé!</p>
                            <p style="color: #666; font-size: 14px;">Centro Umbandista Reino Da Mata</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #f8f8f8; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
                            <p style="color: #999; font-size: 12px; margin: 0;">
                                Centro Umbandista Reino Da Mata<br>
                                <a href="${myEventsUrl}" style="color: #4a7c2a; text-decoration: none;">Ver mis inscripciones</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `;

      } else {
        // Inscripción confirmada (evento gratuito o pago completado)
        subject = `✅ Inscripción confirmada: ${eventTitle}`;
        textContent = `
¡Hola ${userName}!

¡Tu inscripción ha sido confirmada!

Estás inscrito/a en el evento:

"${eventTitle}"

📅 Fecha: ${formattedDate}
${eventDetails?.location ? `📍 Ubicación: ${eventDetails.location}` : ''}
${eventDetails?.duration ? `⏱️ Duración: ${eventDetails.duration} horas` : ''}
${eventDetails?.isOnline ? '💻 Este es un evento online. Recibirás el enlace de acceso antes del inicio.' : ''}

${eventDetails?.description ? `
${eventDetails.description}
` : ''}

Ver detalles completos: ${eventUrl}
Ver mis inscripciones: ${myEventsUrl}

Te esperamos. Si tienes alguna pregunta, no dudes en contactarnos.

¡Axé!

Centro Umbandista Reino Da Mata
        `.trim();

        htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Inscripción confirmada</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td style="padding: 20px 0;">
                <table style="width: 600px; max-width: 100%; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="background-color: #2d5016; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                            <h1 style="margin: 0; font-size: 24px;">Centro Umbandista Reino Da Mata</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 30px;">
                            <div style="text-align: center; margin-bottom: 20px;">
                                <div style="display: inline-block; background-color: #d4edda; color: #155724; padding: 10px 20px; border-radius: 50px; font-weight: 600;">
                                    ✅ Inscripción Confirmada
                                </div>
                            </div>
                            <h2 style="color: #2d5016; margin-bottom: 20px;">¡Hola ${userName}!</h2>
                            <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                                ¡Tu inscripción ha sido confirmada! Estás inscrito/a en:
                            </p>
                            <div style="background-color: #f8f8f8; padding: 20px; border-left: 4px solid #4a7c2a; margin: 20px 0;">
                                <h3 style="color: #2d5016; margin: 0 0 15px 0;">${eventTitle}</h3>
                                <p style="color: #666; margin: 5px 0;">📅 <strong>Fecha:</strong> ${formattedDate}</p>
                                ${eventDetails?.location ? `<p style="color: #666; margin: 5px 0;">📍 <strong>Ubicación:</strong> ${eventDetails.location}</p>` : ''}
                                ${eventDetails?.duration ? `<p style="color: #666; margin: 5px 0;">⏱️ <strong>Duración:</strong> ${eventDetails.duration} horas</p>` : ''}
                                ${eventDetails?.isOnline ? '<p style="color: #666; margin: 5px 0;">💻 <strong>Modalidad:</strong> Online (recibirás el enlace antes del evento)</p>' : ''}
                            </div>
                            ${eventDetails?.description ? `<p style="color: #666; font-size: 14px; line-height: 1.6; margin: 20px 0;">${eventDetails.description}</p>` : ''}
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${eventUrl}" style="display: inline-block; background: linear-gradient(135deg, #4a7c2a 0%, #2d5016 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 6px; font-weight: 600; font-size: 16px; margin-right: 10px;">Ver detalles</a>
                                <a href="${myEventsUrl}" style="display: inline-block; background-color: #fff; border: 2px solid #4a7c2a; color: #4a7c2a; text-decoration: none; padding: 13px 28px; border-radius: 6px; font-weight: 600; font-size: 16px;">Mis eventos</a>
                            </div>
                            <p style="color: #666; font-size: 14px; line-height: 1.6; margin-top: 20px;">
                                Te esperamos. Si tienes alguna pregunta, no dudes en contactarnos.
                            </p>
                            <p style="color: #2d5016; font-weight: 600; margin-top: 30px;">¡Axé!</p>
                            <p style="color: #666; font-size: 14px;">Centro Umbandista Reino Da Mata</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #f8f8f8; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
                            <p style="color: #999; font-size: 12px; margin: 0;">
                                Centro Umbandista Reino Da Mata<br>
                                ${siteUrlConfig.url}
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `;
      }

      // Enviar correo usando el servicio centralizado
      await sendEmail({
        to: userEmail,
        subject: subject,
        text: textContent,
        html: htmlContent
      });






    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Error al enviar confirmación de inscripción:", errorMessage);
    }
  }
);
