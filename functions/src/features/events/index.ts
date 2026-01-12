/**
 * Cloud Functions para gestión de eventos
 */

import * as admin from "firebase-admin";
import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

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

    const {registrationId, eventId, userId, reason} = request.data;

    logger.info("Cancelando registro", {
      registrationId,
      eventId,
      userId,
      requestUserId: request.auth.uid,
    });

    try {
      const db = admin.firestore();

      // Si se proporciona registrationId, usar directamente
      if (registrationId) {
        const regRef = db.collection("event_registrations").doc(registrationId);
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
          const eventRef = db.collection("academic_events").doc(regData.eventId);
          await eventRef.update({
            currentParticipants: admin.firestore.FieldValue.increment(-1),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }

        logger.info("Registro cancelado exitosamente", {registrationId});

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
      const querySnapshot = await db
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

      logger.info("Registro cancelado exitosamente", {id: regDoc.id});

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
