import { onCall } from "firebase-functions/v2/https";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";
import fetch from "node-fetch";
import { getMailgunConfig, getAllowedOrigins, isValidEmail, validateEmailList, isAdminUser, getSiteUrlConfig } from "./config/mailgun"; // Importar getSiteUrlConfig
import * as path from "path";
import * as fs from "fs";
import { v4 as uuidv4 } from "uuid";

/**
 * Envía un newsletter a todos los suscriptores activos
 */
export const sendNewsletterToSubscribers = onCall(
  { 
    memory: "1GiB",
    cors: getAllowedOrigins()
  },
  async (request) => {
    try {
      // Obtener configuración segura de Mailgun
      const mailgunConfig = getMailgunConfig();
      
      // Verificar parámetros requeridos
      const data = request.data;
      
      if (!data.subject || !data.content) {
        throw new Error("Se requiere asunto y contenido");
      }

      // Obtener todos los suscriptores activos
      const subscribersSnapshot = await admin
        .firestore()
        .collection("subscribers")
        .where("active", "==", true)
        .get();

      if (subscribersSnapshot.empty) {
        return {
          success: false,
          message: "No hay suscriptores activos",
        };
      }

      // Extraer emails y validarlos
      const subscriberEmails = subscribersSnapshot.docs
        .map((doc) => doc.data().email)
        .filter(email => email && isValidEmail(email));

      if (subscriberEmails.length === 0) {
        return {
          success: false,
          message: "No hay emails válidos para enviar",
        };
      }

      const recipients = validateEmailList(subscriberEmails);
      console.log(`Enviando newsletter a ${recipients.length} suscriptores`);

      if (recipients.length === 0) {
        return {
          success: false,
          message: "No hay destinatarios válidos después de la validación.",
        };
      }

      // Preparar contenido
      const subject = data.subject;
      const textContent = data.content;
      const htmlContent = data.htmlContent || `<html><body><p>${textContent.replace(/\n/g, "<br>")}</p></body></html>`;
      const senderName = data.fromName || mailgunConfig.fromName;

      const BATCH_SIZE = 500;
      let successfulBatches = 0;
      let failedBatches = 0;
      let successfulSends = 0;
      let totalProcessedEmailsInFailedBatches = 0;
      const totalBatches = Math.ceil(recipients.length / BATCH_SIZE);

      const auth = Buffer.from(`api:${mailgunConfig.apiKey}`).toString("base64");

      for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
        const currentBatch = recipients.slice(i, i + BATCH_SIZE);
        console.log(`Procesando lote ${ (i / BATCH_SIZE) + 1 }/${totalBatches} con ${currentBatch.length} correos.`);

        const formData = new URLSearchParams();
        formData.append("from", `${senderName} <${mailgunConfig.fromEmail}>`);
        formData.append("to", currentBatch.join(",")); // Comma-separated list for 'to'
        formData.append("subject", subject);
        formData.append("text", textContent);
        formData.append("html", htmlContent);
        // Mailgun specific: add recipient variables if you use them for per-recipient data
        // formData.append('recipient-variables', JSON.stringify(batchRecipientVariables));

        try {
          const response = await fetch(
            `${mailgunConfig.baseUrl}/${mailgunConfig.domain}/messages`,
            {
              method: "POST",
              headers: {
                Authorization: `Basic ${auth}`,
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: formData,
            }
          );

          if (!response.ok) {
            const errorData = await response.text();
            console.error(`Error en Mailgun para el lote ${ (i / BATCH_SIZE) + 1 }: ${response.statusText}`, errorData);
            failedBatches++;
            totalProcessedEmailsInFailedBatches += currentBatch.length;
          } else {
            const responseData = await response.json();
            console.log(`Respuesta de Mailgun para el lote ${ (i / BATCH_SIZE) + 1 }:`, responseData);
            successfulBatches++;
            successfulSends += currentBatch.length;
          }
        } catch (batchError: any) {
          console.error(`Error crítico procesando el lote ${ (i / BATCH_SIZE) + 1 }:`, batchError);
          failedBatches++;
          totalProcessedEmailsInFailedBatches += currentBatch.length;
        }

        // Opcional: Pausa entre lotes
        if ( (i / BATCH_SIZE) + 1 < totalBatches ) { // No esperar después del último lote
           await new Promise(resolve => setTimeout(resolve, 500)); // 0.5 segundos
        }
      }

      const overallSuccess = successfulBatches > 0 || recipients.length === 0; // Consider success if at least one batch sent or no recipients
      let message = `Proceso de envío de newsletter completado. Total de destinatarios: ${recipients.length}. Lotes procesados: ${totalBatches}. `;
      message += `Lotes exitosos: ${successfulBatches}, Lotes fallidos: ${failedBatches}. `;
      message += `Correos enviados aproximadamente: ${successfulSends}. Correos en lotes fallidos: ${totalProcessedEmailsInFailedBatches}.`;

      console.log(message);

      return {
        success: overallSuccess,
        message: message,
        totalRecipients: recipients.length,
        successfulSends: successfulSends,
        // failedSends reflects emails in batches that failed, not individual email failures
        failedEmailsInBatches: totalProcessedEmailsInFailedBatches,
        totalBatches: totalBatches,
        successfulBatches: successfulBatches,
        failedBatches: failedBatches,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error("Error crítico al enviar newsletter:", error); // 'Error al enviar newsletter' cambiado a 'Error crítico...'
      return {
        success: false,
        message: `Error al enviar newsletter: ${errorMessage}`,
      };
    }
  }
);

/**
 * Función que se ejecuta cuando se crea un nuevo suscriptor
 * Envía un correo de confirmación de suscripción
 */
export const sendSubscriptionConfirmation = onDocumentCreated(
  "subscribers/{subscriberId}",
  async (event) => {
    try {
      // Obtener configuración segura de Mailgun
      const mailgunConfig = getMailgunConfig();
      
      const subscriber = event.data?.data();
      if (!subscriber) {
        console.error("No se encontraron datos del suscriptor");
        return;
      }

      const { email, firstName = "", unsubscribeToken } = subscriber; // Extraer unsubscribeToken
      
      if (!email || !isValidEmail(email)) {
        return;
      }

      if (!unsubscribeToken) {
        console.error(`Falta unsubscribeToken para el suscriptor: ${email}. No se puede generar enlace de desuscripción.`);
        // Considerar si se debe enviar el correo igualmente o no. Por ahora, se enviará sin el enlace.
      }

      const siteUrlConfig = getSiteUrlConfig();
      const unsubscribeLink = unsubscribeToken ? `${siteUrlConfig.url}/unsubscribe?token=${unsubscribeToken}` : null;

      console.log(`Enviando correo de confirmación a: ${email}`);

      // Contenido del correo de confirmación (texto plano)
      let textContent = `
¡Hola ${firstName || "Suscriptor"}!

Gracias por suscribirte al newsletter del Centro Umbandista Reino Da Mata.

A partir de ahora recibirás nuestras actualizaciones, artículos y noticias directamente en tu correo electrónico.
`;
      const unsubscribeTextParagraph = unsubscribeLink
        ? `Si deseas cancelar tu suscripción en cualquier momento, visita: ${unsubscribeLink}`
        : `Si deseas cancelar tu suscripción en cualquier momento, puedes hacerlo desde nuestro sitio web.`;
      textContent += `\n\n${unsubscribeTextParagraph}`;
      textContent += `

¡Axé!

Centro Umbandista Reino Da Mata
      `.trim();

      // Contenido HTML desde plantilla
      let htmlContent: string;
      try {
        // Asumimos que 'templates' está al mismo nivel que el archivo JS compilado (e.g., en 'lib/templates')
        const templatePath = path.join(__dirname, 'templates', 'subscription-confirmation.html');
        const emailHtmlTemplate = fs.readFileSync(templatePath, 'utf8');

        const unsubscribeHtmlParagraph = unsubscribeLink
          ? `Si deseas cancelar tu suscripción, <a href="${unsubscribeLink}" style="color: #1a73e8;">haz clic aquí</a>.`
          : `Si deseas cancelar tu suscripción en cualquier momento, puedes hacerlo desde nuestro sitio web.`;

        htmlContent = emailHtmlTemplate.replace('{{firstName}}', firstName || "Suscriptor");
        htmlContent = htmlContent.replace('{{unsubscribeParagraph}}', unsubscribeHtmlParagraph);
      } catch (templateError) {
        console.error("Error al leer o procesar la plantilla de correo HTML:", templateError);
        // Fallback a un HTML simple si la plantilla falla
        htmlContent = `
          <html><body>
            <p>Hola ${firstName || "Suscriptor"},</p>
            <p>Gracias por suscribirte.</p>
            <p>${unsubscribeTextParagraph}</p>
            <p>¡Axé!</p>
          </body></html>`;
      }

      // Enviar correo usando Mailgun
      const auth = Buffer.from(`api:${mailgunConfig.apiKey}`).toString("base64");
      const formData = new URLSearchParams();
      
      formData.append("from", `${mailgunConfig.fromName} <${mailgunConfig.fromEmail}>`);
      formData.append("to", email);
      formData.append("subject", "Confirmación de suscripción - Centro Umbandista Reino Da Mata");
      formData.append("text", textContent);
      formData.append("html", htmlContent);

      const response = await fetch(
        `${mailgunConfig.baseUrl}/${mailgunConfig.domain}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Error en Mailgun:", errorData);
        throw new Error(`Error al enviar el correo: ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log("Respuesta de Mailgun:", responseData);
      console.log(`Correo de confirmación enviado a ${email} (${firstName})`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error("Error al enviar correo de confirmación:", errorMessage);
    }
  }
);

/**
 * Función para enviar correo de prueba
 */
export const sendTestNewsletter = onCall(
  { 
    memory: "512MiB",
    cors: getAllowedOrigins()
  },
  async (request) => {
    try {
      // Obtener configuración segura de Mailgun
      const mailgunConfig = getMailgunConfig();
      
      // Verificar parámetros requeridos
      const data = request.data;
      
      if (!data.subject || !data.content || !data.testEmail) {
        throw new Error("Se requiere asunto, contenido y correo de destino");
      }

      // Validar formato de correo electrónico
      if (!isValidEmail(data.testEmail)) {
        throw new Error("Formato de correo electrónico inválido");
      }

      // Preparar contenido
      const subject = data.subject;
      const textContent = data.content;
      const htmlContent = data.htmlContent || `<html><body><p>${textContent.replace(/\n/g, "<br>")}</p></body></html>`;
      const senderName = data.fromName || mailgunConfig.fromName;
      const testEmail = data.testEmail;

      // Enviar correo usando Mailgun
      const auth = Buffer.from(`api:${mailgunConfig.apiKey}`).toString("base64");
      const formData = new URLSearchParams();
      
      formData.append("from", `${senderName} <${mailgunConfig.fromEmail}>`);
      formData.append("to", testEmail);
      formData.append("subject", `[PRUEBA] ${subject}`);
      formData.append("text", `[CORREO DE PRUEBA] \n\n${textContent}\n\nEste es un correo de prueba. No se ha enviado a ningún suscriptor.`);
      
      // Modificar el HTML para indicar que es una prueba
      const testBanner = `
        <div style="background-color: #f8d7da; color: #721c24; padding: 10px; margin-bottom: 15px; border: 1px solid #f5c6cb; border-radius: 5px;">
          <strong>CORREO DE PRUEBA</strong><br>
          Este es un correo de prueba. No se ha enviado a ningún suscriptor.
        </div>
      `;
      
      const testHtmlContent = htmlContent.replace('<body>', `<body>${testBanner}`);
      formData.append("html", testHtmlContent);

      const response = await fetch(
        `${mailgunConfig.baseUrl}/${mailgunConfig.domain}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Error en Mailgun:", errorData);
        throw new Error(`Error al enviar el correo de prueba: ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log("Respuesta de Mailgun para correo de prueba:", responseData);

      return {
        success: true,
        message: `Correo de prueba enviado exitosamente a ${testEmail}`,
        mailgunResponse: responseData
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error("Error al enviar correo de prueba:", error);
      return {
        success: false,
        message: `Error al enviar correo de prueba: ${errorMessage}`,
      };
    }
  }
);

/**
 * Función programada para limpiar suscriptores inactivos (ejecutar mensualmente)
 */
export const cleanupInactiveSubscribers = onSchedule(
  {
    schedule: "0 0 1 * *", // Ejecutar a las 00:00 del primer día de cada mes
    timeZone: "America/Sao_Paulo",
    region: "us-central1",
    memory: "256MiB"
  },
  async (_event) => {
    try {
      console.log("Iniciando limpieza de suscriptores inactivos...");
      
      // Buscar suscriptores inactivos con más de 6 meses de inactividad
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const inactiveSubscribersSnapshot = await admin
        .firestore()
        .collection("subscribers")
        .where("active", "==", false)
        .where("createdAt", "<", admin.firestore.Timestamp.fromDate(sixMonthsAgo))
        .get();
      
      if (inactiveSubscribersSnapshot.empty) {
        console.log("No se encontraron suscriptores inactivos para limpiar");
        return;
      }
      
      console.log(`Se encontraron ${inactiveSubscribersSnapshot.docs.length} suscriptores inactivos para eliminar`);
      
      // Eliminar en lotes de 500 (límite de Firestore)
      const batch = admin.firestore().batch();
      inactiveSubscribersSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      console.log(`Se eliminaron ${inactiveSubscribersSnapshot.docs.length} suscriptores inactivos`);
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error("Error en limpieza de suscriptores:", errorMessage);
    }
  }
);

/**
 * Registra una visita a la página en Firestore
 * Esta función puede ser llamada desde el cliente para registrar visitas anónimas
 */
export const recordPageView = onCall(
  { 
    memory: "256MiB",
    cors: ["http://localhost:4321", "https://centroumbandistareinodamata.org", "https://website-reino-da-mata.web.app"]
  },
  async (request) => {
    try {
      // Validar datos
      const data = request.data;
      
      if (!data.path) {
        throw new Error("Se requiere una ruta de página");
      }

      // Obtener información de la visita
      const path = data.path as string;
      const referrer = data.referrer as string || null;
      const userAgent = data.userAgent as string || null;
      const timestamp = admin.firestore.FieldValue.serverTimestamp();
      
      // Identificar usuario (si está autenticado)
      const userId = request.auth?.uid || null;
      
      // Crear documento de visita
      const pageView = {
        path,
        referrer,
        userAgent,
        timestamp,
        userId
      };
      
      // Guardar en Firestore
      await admin.firestore().collection("pageViews").add(pageView);
      
      return { success: true };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error("Error al registrar visita:", errorMessage);
      return { 
        success: false, 
        message: `Error al registrar la visita: ${errorMessage}` 
      };
    }
  }
);

/**
 * Función programada para eliminar visitas antiguas (más de 1 año)
 * Esto ayuda a mantener la base de datos limpia y reducir costos
 */
export const cleanupOldPageViews = onSchedule(
  {
    schedule: "0 0 1 * *", // Ejecutar a las 00:00 del primer día de cada mes
    timeZone: "America/Sao_Paulo",
    region: "us-central1",
    memory: "256MiB"
  },
  async (_event) => {
    try {
      // Calcular fecha límite (1 año atrás)
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      
      // Consultar visitas antiguas
      const snapshot = await admin
        .firestore()
        .collection("pageViews")
        .where("timestamp", "<", oneYearAgo)
        .limit(500) // Procesar en lotes para evitar problemas de rendimiento
        .get();
      
      // Si no hay visitas antiguas, terminar
      if (snapshot.empty) {
        console.log("No hay visitas antiguas para eliminar");
        return;
      }
      
      // Eliminar visitas antiguas en batch
      const batch = admin.firestore().batch();
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      
      console.log(`Eliminadas ${snapshot.size} visitas antiguas`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error("Error al limpiar visitas antiguas:", errorMessage);
    }
  }
);

/**
 * Suscribir un nuevo email
 */
export const subscribeEmail = onCall(
  { 
    memory: "256MiB",
    cors: getAllowedOrigins()
  },
  async (request) => {
    try {
      console.log('Nueva suscripción solicitada:', { data: request.data, context: request.auth?.uid });
      
      // Validar que tenga los datos necesarios
      if (!request.data || !request.data.email) {
        throw new Error('El email es requerido');
      }

      const { email, name } = request.data;

      // Validar formato del email
      if (!isValidEmail(email)) {
        throw new Error('El formato del email no es válido');
      }

      // Verificar si ya está suscrito
      const subscribersRef = admin.firestore().collection('subscribers');
      const existingQuery = await subscribersRef
        .where('email', '==', email.toLowerCase())
        .where('active', '==', true)
        .get();

      if (!existingQuery.empty) {
        throw new Error('Este email ya está suscrito');
      }

      // Crear token para cancelar suscripción
      const unsubscribeToken = uuidv4();

      // Agregar a Firestore
      const docRef = await subscribersRef.add({
        email: email.toLowerCase(),
        name: name || '',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        active: true,
        unsubscribeToken,
        source: 'web'
      });

      console.log('Suscripción exitosa:', { id: docRef.id, email });
      
      return {
        success: true,
        message: 'Suscripción exitosa',
        subscriberId: docRef.id
      };

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('Error en subscribeEmail:', error);
      
      return {
        success: false,
        message: `Error al suscribir: ${errorMessage}`
      };
    }
  }
);

/**
 * Función para enviar email de prueba (solo para testing)
 */
export const sendTestEmail = onCall(
  { 
    memory: "256MiB",
    cors: getAllowedOrigins()
  },
  async (request) => {
    try {
      // Verificar autenticación de admin
      if (!request.auth) {
        throw new Error('Usuario no autenticado');
      }

      const userEmail = request.auth.token.email;
      if (!userEmail || !isAdminUser(userEmail)) {
        throw new Error('Sin permisos de administrador');
      }

      const { to, subject, content } = request.data;
      const config = getMailgunConfig();

      if (!to || !subject || !content) {
        throw new Error('Faltan parámetros requeridos');
      }

      const formData = new URLSearchParams();
      formData.append('from', `Centro Umbandista Reino Da Mata <${config.fromEmail}>`);
      formData.append('to', to);
      formData.append('subject', subject);
      formData.append('html', content);

      const response = await fetch(`${config.baseUrl}/${config.domain}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`api:${config.apiKey}`).toString('base64')}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error enviando email de prueba:', errorText);
        throw new Error('Error enviando email');
      }

      console.log('Email de prueba enviado exitosamente a:', to);
      return { success: true, message: 'Email enviado' };

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('Error en sendTestEmail:', error);
      
      return {
        success: false,
        message: `Error al enviar email de prueba: ${errorMessage}`
      };
    }
  }
); 