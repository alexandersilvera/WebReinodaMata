import { onCall } from "firebase-functions/v2/https";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { onSchedule } from "firebase-functions/v2/scheduler";
// import { beforeUserCreated } from "firebase-functions/v2/identity"; // Para futura compatibilidad con GCIP
import * as functions from "firebase-functions";
import { logger } from "firebase-functions";
import * as admin from "firebase-admin";
import fetch from "node-fetch";
import { getMailgunConfig, isValidEmail, validateEmailList, isAdminUser, getSiteUrlConfig } from "./config/mailgun";
import { loadEmailTemplate, formatContentForHtml, createCallToAction, EmailTemplateData } from "./utils/emailTemplates";
import { v4 as uuidv4 } from "uuid";

// Configuración CORS unificada - ACTUALIZADA
const CORS_CONFIG = [
  /^https?:\/\/localhost:\d+$/,
  /^https?:\/\/127\.0\.0\.1:\d+$/,
  "https://web-reinoda-mata.vercel.app",
  "https://reinodamata.com",
  "https://centroumbandistareinodamata.org",
  "https://www.centroumbandistareinodamata.org",
  /^https:\/\/(www\.)?centroumbandistareinodamata\.org$/,
  // Agregar más variantes para asegurar compatibilidad
  "http://localhost:4321",
  "http://localhost:3000",
  "http://127.0.0.1:4321",
  "http://127.0.0.1:3000"
];

/**
 * Envía un newsletter a todos los suscriptores activos
 */
export const sendNewsletterToSubscribers = onCall(
  { 
    memory: "1GiB",
    cors: CORS_CONFIG
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

      console.log('Usuario admin autenticado:', userEmail);

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

      // Preparar contenido con plantillas profesionales
      const subject = data.subject;
      const textContent = data.content;
      const senderName = data.fromName || mailgunConfig.fromName;
      
      // Generar HTML usando plantillas profesionales
      let htmlContent: string;
      if (data.htmlContent) {
        // Si viene HTML personalizado, usarlo
        htmlContent = data.htmlContent;
      } else {
        // Formatear contenido de texto para HTML
        const formattedContent = formatContentForHtml(textContent);
        
        // Crear call-to-action si hay URL
        let callToAction = '';
        if (data.actionUrl && data.actionText) {
          callToAction = createCallToAction(data.actionText, data.actionUrl);
        }
        
        // Usar plantilla profesional
        const templateData: EmailTemplateData = {
          subject: subject,
          content: formattedContent,
          callToAction: callToAction,
          siteUrl: getSiteUrlConfig().url
        };
        
        htmlContent = loadEmailTemplate('newsletter-base', templateData);
      }

      const BATCH_SIZE = 5; // Reducido para evitar restricciones de Mailgun
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
        
        // Headers adicionales para mejorar deliverability
        formData.append("h:Reply-To", mailgunConfig.fromEmail);
        formData.append("h:List-Unsubscribe", `<${getSiteUrlConfig().url}/unsubscribe>`);
        formData.append("h:List-Id", "Centro Umbandista Reino Da Mata Newsletter");
        formData.append("h:X-Mailgun-Native-Send", "true");
        
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

        // Pausa entre lotes para evitar rate limiting
        if ( (i / BATCH_SIZE) + 1 < totalBatches ) { // No esperar después del último lote
           console.log(`Esperando 3 segundos antes del siguiente lote...`);
           await new Promise(resolve => setTimeout(resolve, 3000)); // 3 segundos
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
 * Función que se ejecuta cuando se publica un nuevo artículo
 * Envía automáticamente un email a todos los suscriptores activos
 */
export const sendArticleNewsletter = onDocumentCreated(
  "articles/{articleId}",
  async (event) => {
    try {
      const articleData = event.data?.data();
      if (!articleData) {
        console.error("No se encontraron datos del artículo");
        return;
      }

      // Solo enviar si el artículo está publicado y no se ha enviado email antes
      if (!articleData.published || articleData.emailSent) {
        console.log(`Artículo ${event.params.articleId} no cumple condiciones para envío automático`);
        return;
      }

      console.log(`Enviando newsletter automático para artículo: ${articleData.title}`);

      // Obtener configuración segura de Mailgun
      const mailgunConfig = getMailgunConfig();
      const siteUrlConfig = getSiteUrlConfig();

      // Obtener todos los suscriptores activos
      const subscribersSnapshot = await admin
        .firestore()
        .collection("subscribers")
        .where("active", "==", true)
        .get();

      if (subscribersSnapshot.empty) {
        console.log("No hay suscriptores activos para el artículo");
        return;
      }

      const subscriberEmails = subscribersSnapshot.docs
        .map((doc) => doc.data().email)
        .filter(email => email && isValidEmail(email));

      if (subscriberEmails.length === 0) {
        console.log("No hay emails válidos para enviar");
        return;
      }

      const recipients = validateEmailList(subscriberEmails);
      console.log(`Enviando artículo a ${recipients.length} suscriptores`);

      // Preparar contenido del email
      const subject = `📖 Nuevo artículo: ${articleData.title}`;
      const articleUrl = `${siteUrlConfig.url}/blog/${articleData.slug}`;
      
      const textContent = `
¡Hola!

Hemos publicado un nuevo artículo en nuestro blog:

"${articleData.title}"

${articleData.excerpt || 'Te invitamos a leer este interesante artículo sobre nuestra práctica espiritual.'}

Lee el artículo completo aquí: ${articleUrl}

¡Que disfrutes la lectura!

Centro Umbandista Reino Da Mata
${siteUrlConfig.url}
`;

      // Generar HTML usando plantilla profesional
      const templateData = {
        subject: subject,
        content: `
<h2 style="color: #2d5016; margin-bottom: 20px;">📖 Nuevo artículo publicado</h2>
<h3 style="color: #4a7c2a; margin-bottom: 15px;">${articleData.title}</h3>
<p style="color: #666; margin-bottom: 20px; font-size: 16px; line-height: 1.6;">
  ${articleData.excerpt || 'Te invitamos a leer este interesante artículo sobre nuestra práctica espiritual.'}
</p>
<div style="margin: 30px 0; text-align: center;">
  <a href="${articleUrl}" style="
    display: inline-block;
    background: linear-gradient(135deg, #4a7c2a 0%, #2d5016 100%);
    color: white;
    text-decoration: none;
    padding: 15px 30px;
    border-radius: 6px;
    font-weight: 600;
    font-size: 16px;
    box-shadow: 0 3px 12px rgba(45, 80, 22, 0.3);
  ">📖 Leer artículo completo</a>
</div>
        `,
        callToAction: '',
        siteUrl: siteUrlConfig.url
      };

      const htmlContent = loadEmailTemplate('newsletter-base', templateData);

      // Enviar en lotes pequeños
      const BATCH_SIZE = 5;
      let successfulSends = 0;
      let failedSends = 0;
      const totalBatches = Math.ceil(recipients.length / BATCH_SIZE);
      const auth = Buffer.from(`api:${mailgunConfig.apiKey}`).toString("base64");

      for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
        const currentBatch = recipients.slice(i, i + BATCH_SIZE);
        console.log(`Procesando lote artículo ${ (i / BATCH_SIZE) + 1 }/${totalBatches} con ${currentBatch.length} correos.`);

        const formData = new URLSearchParams();
        formData.append("from", `${mailgunConfig.fromName} <${mailgunConfig.fromEmail}>`);
        formData.append("to", currentBatch.join(","));
        formData.append("subject", subject);
        formData.append("text", textContent);
        formData.append("html", htmlContent);
        
        // Headers adicionales
        formData.append("h:Reply-To", mailgunConfig.fromEmail);
        formData.append("h:List-Unsubscribe", `<${siteUrlConfig.url}/unsubscribe>`);
        formData.append("h:List-Id", "Centro Umbandista Reino Da Mata - Nuevos Artículos");

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
            console.error(`Error en Mailgun para artículo lote ${ (i / BATCH_SIZE) + 1 }: ${response.statusText}`, errorData);
            failedSends += currentBatch.length;
          } else {
            const responseData = await response.json();
            console.log(`Artículo enviado exitosamente lote ${ (i / BATCH_SIZE) + 1 }:`, responseData);
            successfulSends += currentBatch.length;
          }
        } catch (batchError: any) {
          console.error(`Error crítico enviando artículo lote ${ (i / BATCH_SIZE) + 1 }:`, batchError);
          failedSends += currentBatch.length;
        }

        // Pausa entre lotes
        if ( (i / BATCH_SIZE) + 1 < totalBatches ) {
          console.log(`Esperando 3 segundos antes del siguiente lote de artículo...`);
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }

      // Marcar como enviado en Firestore
      await admin.firestore().collection("articles").doc(event.params.articleId).update({
        emailSent: true,
        emailSentAt: admin.firestore.FieldValue.serverTimestamp(),
        emailStats: {
          totalSent: successfulSends,
          totalFailed: failedSends,
          totalRecipients: recipients.length
        }
      });

      console.log(`Newsletter de artículo completado. Enviados: ${successfulSends}, Fallidos: ${failedSends}`);

    } catch (error) {
      console.error("Error al enviar newsletter de artículo:", error);
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

      // Generar contenido usando la nueva plantilla
      const textContent = `
¡Hola ${firstName || "Suscriptor"}!

Gracias por suscribirte al newsletter del Centro Umbandista Reino Da Mata.

Es un honor tenerte en nuestra comunidad espiritual. A partir de ahora recibirás nuestras actualizaciones, artículos y noticias directamente en tu correo electrónico.

¿Qué puedes esperar?
- Artículos sobre espiritualidad y sabiduría ancestral
- Noticias y eventos de nuestro centro
- Reflexiones y enseñanzas espirituales
- Invitaciones a ceremonias y actividades especiales

${unsubscribeLink ? `Si deseas cancelar tu suscripción en cualquier momento, visita: ${unsubscribeLink}` : 'Si deseas cancelar tu suscripción en cualquier momento, puedes hacerlo desde nuestro sitio web.'}

¡Axé!

Centro Umbandista Reino Da Mata
      `.trim();

      // Usar la nueva plantilla profesional
      const templateData: EmailTemplateData = {
        firstName: firstName || "Suscriptor",
        unsubscribeLink: unsubscribeLink || undefined,
        siteUrl: siteUrlConfig.url
      };

      const htmlContent = loadEmailTemplate('subscription-confirmation', templateData);

      // Enviar correo usando Mailgun
      const auth = Buffer.from(`api:${mailgunConfig.apiKey}`).toString("base64");
      const formData = new URLSearchParams();
      
      formData.append("from", `${mailgunConfig.fromName} <${mailgunConfig.fromEmail}>`);
      formData.append("to", email);
      formData.append("subject", "Confirmación de suscripción - Centro Umbandista Reino Da Mata");
      formData.append("text", textContent);
      formData.append("html", htmlContent);
      
      // Headers adicionales para mejorar deliverability
      formData.append("h:Reply-To", mailgunConfig.fromEmail);
      formData.append("h:List-Unsubscribe", unsubscribeLink ? `<${unsubscribeLink}>` : `<${siteUrlConfig.url}/unsubscribe>`);
      formData.append("h:List-Id", "Centro Umbandista Reino Da Mata Newsletter");
      formData.append("h:X-Mailgun-Native-Send", "true");

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
    memory: "256MiB",
    cors: CORS_CONFIG
  },
  async (request) => {
    try {
      // En desarrollo local, permitir sin autenticación para testing
      const isDevelopment = process.env.FUNCTIONS_EMULATOR === 'true';
      
      if (!isDevelopment) {
        // Verificar autenticación de admin solo en producción
        if (!request.auth) {
          throw new Error('Usuario no autenticado');
        }

        const userEmail = request.auth.token.email;
        if (!userEmail || !isAdminUser(userEmail)) {
          throw new Error('Sin permisos de administrador');
        }

        console.log('Usuario admin autenticado:', userEmail);
      } else {
        console.log('Modo desarrollo: saltando verificación de autenticación');
      }

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
      const senderName = data.fromName || mailgunConfig.fromName;
      const testEmail = data.testEmail;

      // Usar plantilla profesional para emails de prueba
      const formattedContent = formatContentForHtml(textContent);
      
      // Crear call-to-action si hay URL de prueba
      let callToAction = '';
      if (data.actionUrl && data.actionText) {
        callToAction = createCallToAction(data.actionText, data.actionUrl);
      }
      
      const templateData: EmailTemplateData = {
        subject: subject,
        content: formattedContent,
        callToAction: callToAction,
        siteUrl: getSiteUrlConfig().url
      };
      
      const htmlContent = loadEmailTemplate('test-email', templateData);
      
      const formData = new URLSearchParams({
        'from': `${senderName} <${mailgunConfig.fromEmail}>`,
        'to': testEmail,
        'subject': `[PRUEBA] ${subject}`,
        'html': htmlContent,
        'text': `[CORREO DE PRUEBA]\n\n${textContent}\n\nEste es un correo de prueba. No se ha enviado a ningún suscriptor.`
      });

      const response = await fetch(`${mailgunConfig.baseUrl}/${mailgunConfig.domain}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`api:${mailgunConfig.apiKey}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error enviando email de prueba:', errorText);
        throw new Error(`Error enviando email: ${response.statusText}`);
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
    memory: "128MiB"
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
    cors: CORS_CONFIG
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
    memory: "128MiB"
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
    memory: "128MiB",
    cors: CORS_CONFIG
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
 * Función que se ejecuta automáticamente cuando se crea un nuevo usuario en Firebase Auth
 * Sincroniza el usuario inmediatamente con la colección de suscriptores
 */
export const onUserAuthCreate = onCall(
  { 
    memory: "128MiB",
    cors: CORS_CONFIG
  },
  async (request) => {
    try {
      console.log('🔄 Iniciando sincronización automática de nuevo usuario Auth...');

      // Obtener datos del usuario desde la solicitud
      const { uid, email, displayName } = request.data;

      if (!uid || !email) {
        throw new Error('UID y email son requeridos para la sincronización');
      }

      console.log(`👤 Sincronizando usuario: ${email} (${uid})`);

      // Verificar si ya existe en suscriptores
      const existingQuery = await admin.firestore()
        .collection('subscribers')
        .where('email', '==', email.toLowerCase())
        .get();

      if (!existingQuery.empty) {
        console.log(`⏭️ Usuario ${email} ya existe en suscriptores`);
        return {
          success: true,
          message: 'Usuario ya sincronizado previamente',
          skipped: true
        };
      }

      // Crear nuevo suscriptor
      const unsubscribeToken = uuidv4();
      
      const subscriberData = {
        email: email.toLowerCase(),
        name: displayName || '',
        firstName: displayName?.split(' ')[0] || '',
        lastName: displayName?.split(' ').slice(1).join(' ') || '',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        active: true,
        unsubscribeToken,
        source: 'auth_auto',
        authUid: uid,
        syncedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      const docRef = await admin.firestore().collection('subscribers').add(subscriberData);

      console.log(`✅ Usuario sincronizado automáticamente: ${email} → ID: ${docRef.id}`);

      return {
        success: true,
        message: `Usuario ${email} sincronizado automáticamente`,
        subscriberId: docRef.id,
        skipped: false
      };

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('❌ Error en sincronización automática:', error);
      
      return {
        success: false,
        message: `Error al sincronizar usuario: ${errorMessage}`
      };
    }
  }
);

// Funciones de test eliminadas para optimizar recursos y resolver problemas de quota de CPU

// Utility functions para el manejo de sincronización
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const validateEmailAdvanced = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  
  // Regex más estricto para validación de email
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  // Verificar dominios bloqueados conocidos
  const blockedDomains = ['tempmail.com', '10minutemail.com', 'guerrillamail.com', 'mailinator.com'];
  const domain = email.split('@')[1]?.toLowerCase();
  
  return emailRegex.test(email) && !!domain && !blockedDomains.includes(domain);
};

const logSyncOperation = (operation: string, data: any, success: boolean, error?: any) => {
  const logData: any = {
    operation,
    success,
    userId: data.uid || 'unknown',
    email: data.email || 'unknown',
    timestamp: new Date().toISOString(),
    source: 'auth_trigger_v2'
  };

  if (error) {
    logData.error = {
      message: error.message,
      code: error.code,
      stack: error.stack?.split('\n').slice(0, 3).join('\n') // Primeras 3 líneas del stack
    };
  }

  if (success) {
    logger.info('sync_success', logData);
  } else {
    logger.error('sync_failure', logData);
  }
};

const saveFailedSync = async (user: any, error: any, attempt: number) => {
  try {
    await admin.firestore().collection('failed_syncs').add({
      userId: user.uid,
      email: user.email,
      displayName: user.displayName,
      error: {
        message: error.message,
        code: error.code,
        name: error.name
      },
      attempt,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      processed: false,
      retryCount: 0
    });
    logger.warn('failed_sync_saved', { userId: user.uid, email: user.email, attempt });
  } catch (saveError: any) {
    logger.error('failed_to_save_sync_error', { 
      originalError: error.message, 
      saveError: saveError?.message || 'Unknown save error',
      userId: user.uid 
    });
  }
};

const syncUserToSubscribersWithRetry = async (user: any, maxRetries: number = 3): Promise<boolean> => {
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      attempt++;
      
      logger.info('sync_attempt_start', { 
        userId: user.uid, 
        email: user.email, 
        attempt, 
        maxRetries 
      });

      // Validación avanzada de email
      if (!validateEmailAdvanced(user.email)) {
        throw new Error(`Email inválido o de dominio bloqueado: ${user.email}`);
      }

      // Verificar si ya existe en suscriptores con timeout
      const existingQuery = await Promise.race([
        admin.firestore()
          .collection('subscribers')
          .where('email', '==', user.email.toLowerCase())
          .limit(1)
          .get(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout en consulta de suscriptor existente')), 10000)
        )
      ]) as admin.firestore.QuerySnapshot;

      if (!existingQuery.empty) {
        logger.info('user_already_subscribed', { 
          userId: user.uid, 
          email: user.email,
          existingSubscriberId: existingQuery.docs[0].id
        });
        return true; // Consideramos esto como éxito
      }

      // Crear nuevo suscriptor con validación
      const unsubscribeToken = uuidv4();
      
      const subscriberData = {
        email: user.email.toLowerCase(),
        name: user.displayName || '',
        firstName: user.displayName?.split(' ')[0] || '',
        lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        active: true,
        unsubscribeToken,
        source: 'auth_trigger_v2',
        authUid: user.uid,
        syncedAt: admin.firestore.FieldValue.serverTimestamp(),
        emailVerified: user.emailVerified || false,
        lastSyncAttempt: attempt,
        syncMethod: 'automatic'
      };

      // Guardar con timeout
      const docRef = await Promise.race([
        admin.firestore().collection('subscribers').add(subscriberData),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout al guardar suscriptor')), 15000)
        )
      ]) as admin.firestore.DocumentReference;
      
      logSyncOperation('user_sync_success', user, true);
      logger.info('sync_success_detail', {
        userId: user.uid,
        email: user.email,
        subscriberId: docRef.id,
        attempt,
        finalAttempt: true
      });
      
      return true;

    } catch (error: any) {
      const isLastAttempt = attempt >= maxRetries;
      
      logSyncOperation('user_sync_attempt_failed', user, false, error);
      
      if (isLastAttempt) {
        // Último intento fallido - guardar para procesamiento manual
        await saveFailedSync(user, error, attempt);
        logSyncOperation('user_sync_final_failure', user, false, error);
        return false;
      } else {
        // Esperar antes del siguiente intento (exponential backoff)
        const backoffTime = Math.min(Math.pow(2, attempt) * 1000, 10000); // Max 10 segundos
        logger.warn('sync_retry_scheduled', {
          userId: user.uid,
          email: user.email,
          attempt,
          nextAttemptIn: backoffTime,
          error: error.message
        });
        
        await delay(backoffTime);
      }
    }
  }
  
  return false;
};

/**
 * Trigger automático para nuevos usuarios - Versión simple y confiable
 * Se ejecuta automáticamente cuando se crea un usuario en Firebase Auth
 */
export const onUserCreate = functions
  .region('us-central1')
  .runWith({
    memory: '256MB',
    timeoutSeconds: 30
  })
  .auth.user().onCreate(async (user: any) => {
    try {
      console.log('🔄 Trigger automático: nuevo usuario detectado', user.email);

      if (!user.email) {
        console.log('⚠️ Usuario sin email, saltando sincronización');
        return;
      }

      // Usar la función de sincronización mejorada que ya tenemos
      const syncSuccess = await syncUserToSubscribersWithRetry(user, 3);
      
      if (syncSuccess) {
        console.log('✅ Sincronización automática exitosa:', user.email);
      } else {
        console.error('❌ Sincronización automática falló tras todos los intentos:', user.email);
      }

    } catch (error: any) {
      console.error('❌ Error crítico en trigger automático:', error);
    }
  });

/**
 * Función programada para procesar sincronizaciones fallidas
 * Se ejecuta cada hora para reintentar sincronizaciones que fallaron
 */
export const processFailedSyncs = onSchedule(
  {
    schedule: "0 * * * *", // Cada hora
    timeZone: "America/Sao_Paulo",
    region: "us-central1",
    memory: "128MiB"
  },
  async (_event) => {
    try {
      logger.info('processing_failed_syncs_started');
      
      // Buscar sincronizaciones fallidas sin procesar
      const failedSyncsSnapshot = await admin
        .firestore()
        .collection("failed_syncs")
        .where("processed", "==", false)
        .where("retryCount", "<", 5) // Máximo 5 reintentos
        .limit(10) // Procesar máximo 10 por ejecución
        .get();
      
      if (failedSyncsSnapshot.empty) {
        logger.info('no_failed_syncs_to_process');
        return;
      }
      
      let processedCount = 0;
      let successCount = 0;
      
      for (const doc of failedSyncsSnapshot.docs) {
        const failedSync = doc.data();
        
        try {
          // Intentar crear el usuario mock para retry
          const mockUser = {
            uid: failedSync.userId,
            email: failedSync.email,
            displayName: failedSync.displayName,
            emailVerified: true // Asumir verificado en retry
          };
          
          const success = await syncUserToSubscribersWithRetry(mockUser, 2); // Solo 2 intentos en retry
          
          if (success) {
            successCount++;
            // Marcar como procesado exitosamente
            await doc.ref.update({
              processed: true,
              processedAt: admin.firestore.FieldValue.serverTimestamp(),
              retrySuccess: true
            });
            
            logger.info('failed_sync_retry_success', {
              docId: doc.id,
              userId: failedSync.userId,
              email: failedSync.email
            });
          } else {
            // Incrementar contador de reintentos
            await doc.ref.update({
              retryCount: admin.firestore.FieldValue.increment(1),
              lastRetryAt: admin.firestore.FieldValue.serverTimestamp()
            });
            
            logger.warn('failed_sync_retry_failed', {
              docId: doc.id,
              userId: failedSync.userId,
              email: failedSync.email,
              retryCount: failedSync.retryCount + 1
            });
          }
          
          processedCount++;
          
        } catch (retryError: any) {
          logger.error('failed_sync_retry_error', {
            docId: doc.id,
            userId: failedSync.userId,
            error: retryError.message
          });
          
          // Incrementar contador aunque haya error
          await doc.ref.update({
            retryCount: admin.firestore.FieldValue.increment(1),
            lastRetryAt: admin.firestore.FieldValue.serverTimestamp(),
            lastError: retryError.message
          });
        }
        
        // Pequeña pausa entre procesamiento
        await delay(1000);
      }
      
      logger.info('processing_failed_syncs_completed', {
        totalProcessed: processedCount,
        successfulRetries: successCount,
        failedRetries: processedCount - successCount
      });
      
    } catch (error: any) {
      logger.error('failed_syncs_processing_error', {
        error: error.message
      });
    }
  }
);

/**
 * Función que se ejecuta cuando se crea un nuevo taller
 * Envía automáticamente invitaciones a todos los suscriptores activos
 */
export const sendWorkshopInvitation = onDocumentCreated(
  "workshops/{workshopId}",
  async (event) => {
    try {
      const workshopData = event.data?.data();
      if (!workshopData) {
        console.error("No se encontraron datos del taller");
        return;
      }

      // Solo enviar si el taller está activo y no se ha enviado invitación antes
      if (!workshopData.active || workshopData.invitationSent) {
        console.log(`Taller ${event.params.workshopId} no cumple condiciones para envío automático`);
        return;
      }

      console.log(`Enviando invitaciones automáticas para taller: ${workshopData.title}`);

      // Obtener configuración segura de Mailgun
      const mailgunConfig = getMailgunConfig();
      const siteUrlConfig = getSiteUrlConfig();

      // Obtener todos los suscriptores activos
      const subscribersSnapshot = await admin
        .firestore()
        .collection("subscribers")
        .where("active", "==", true)
        .get();

      if (subscribersSnapshot.empty) {
        console.log("No hay suscriptores activos para el taller");
        return;
      }

      const subscriberEmails = subscribersSnapshot.docs
        .map((doc) => doc.data().email)
        .filter(email => email && isValidEmail(email));

      if (subscriberEmails.length === 0) {
        console.log("No hay emails válidos para enviar invitaciones");
        return;
      }

      const recipients = validateEmailList(subscriberEmails);
      console.log(`Enviando invitaciones de taller a ${recipients.length} suscriptores`);

      // Preparar contenido del email
      const subject = `🎓 Nuevo taller disponible: ${workshopData.title}`;
      const workshopUrl = `${siteUrlConfig.url}/talleres/${workshopData.slug || event.params.workshopId}`;
      
      // Formatear fecha del taller
      const workshopDate = workshopData.date ? new Date(workshopData.date.seconds * 1000) : new Date();
      const formattedDate = workshopDate.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      const formattedTime = workshopData.time || 'Horario por confirmar';
      
      const textContent = `
¡Hola!

Te invitamos a participar en nuestro nuevo taller:

"${workshopData.title}"

📅 Fecha: ${formattedDate}
⏰ Hora: ${formattedTime}
📍 Lugar: ${workshopData.location || 'Centro Umbandista Reino Da Mata'}

${workshopData.description || 'Un taller especial para fortalecer tu camino espiritual.'}

${workshopData.requirements ? `Requisitos: ${workshopData.requirements}` : ''}

${workshopData.price ? `Inversión: ${workshopData.price}` : 'Taller gratuito'}

¡Inscríbete ya! Los cupos son limitados.

Más información e inscripciones: ${workshopUrl}

¡Te esperamos!

Centro Umbandista Reino Da Mata
${siteUrlConfig.url}
`;

      // Generar HTML usando plantilla profesional
      const templateData = {
        subject: subject,
        content: `
<h2 style="color: #2d5016; margin-bottom: 20px;">🎓 Nuevo taller disponible</h2>
<h3 style="color: #4a7c2a; margin-bottom: 15px;">${workshopData.title}</h3>

<div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
  <p style="margin: 5px 0; color: #333;"><strong>📅 Fecha:</strong> ${formattedDate}</p>
  <p style="margin: 5px 0; color: #333;"><strong>⏰ Hora:</strong> ${formattedTime}</p>
  <p style="margin: 5px 0; color: #333;"><strong>📍 Lugar:</strong> ${workshopData.location || 'Centro Umbandista Reino Da Mata'}</p>
  ${workshopData.price ? `<p style="margin: 5px 0; color: #333;"><strong>💰 Inversión:</strong> ${workshopData.price}</p>` : '<p style="margin: 5px 0; color: #4a7c2a;"><strong>🎁 Taller gratuito</strong></p>'}
</div>

<p style="color: #666; margin-bottom: 20px; font-size: 16px; line-height: 1.6;">
  ${workshopData.description || 'Un taller especial para fortalecer tu camino espiritual.'}
</p>

${workshopData.requirements ? `
<div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
  <p style="margin: 0; color: #856404;"><strong>📋 Requisitos:</strong> ${workshopData.requirements}</p>
</div>
` : ''}

<div style="background: #d4edda; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
  <p style="margin: 0; color: #155724;"><strong>⚠️ Cupos limitados</strong> - ¡Inscríbete lo antes posible!</p>
</div>

<div style="margin: 30px 0; text-align: center;">
  <a href="${workshopUrl}" style="
    display: inline-block;
    background: linear-gradient(135deg, #4a7c2a 0%, #2d5016 100%);
    color: white;
    text-decoration: none;
    padding: 15px 30px;
    border-radius: 6px;
    font-weight: 600;
    font-size: 16px;
    box-shadow: 0 3px 12px rgba(45, 80, 22, 0.3);
  ">🎓 Inscribirme al taller</a>
</div>
        `,
        callToAction: '',
        siteUrl: siteUrlConfig.url
      };

      const htmlContent = loadEmailTemplate('workshop-invitation', templateData);

      // Enviar en lotes pequeños
      const BATCH_SIZE = 5;
      let successfulSends = 0;
      let failedSends = 0;
      const totalBatches = Math.ceil(recipients.length / BATCH_SIZE);
      const auth = Buffer.from(`api:${mailgunConfig.apiKey}`).toString("base64");

      for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
        const currentBatch = recipients.slice(i, i + BATCH_SIZE);
        console.log(`Procesando lote taller ${ (i / BATCH_SIZE) + 1 }/${totalBatches} con ${currentBatch.length} correos.`);

        const formData = new URLSearchParams();
        formData.append("from", `${mailgunConfig.fromName} <${mailgunConfig.fromEmail}>`);
        formData.append("to", currentBatch.join(","));
        formData.append("subject", subject);
        formData.append("text", textContent);
        formData.append("html", htmlContent);
        
        // Headers adicionales
        formData.append("h:Reply-To", mailgunConfig.fromEmail);
        formData.append("h:List-Unsubscribe", `<${siteUrlConfig.url}/unsubscribe>`);
        formData.append("h:List-Id", "Centro Umbandista Reino Da Mata - Talleres");

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
            console.error(`Error en Mailgun para taller lote ${ (i / BATCH_SIZE) + 1 }: ${response.statusText}`, errorData);
            failedSends += currentBatch.length;
          } else {
            const responseData = await response.json();
            console.log(`Invitación de taller enviada exitosamente lote ${ (i / BATCH_SIZE) + 1 }:`, responseData);
            successfulSends += currentBatch.length;
          }
        } catch (batchError: any) {
          console.error(`Error crítico enviando invitación de taller lote ${ (i / BATCH_SIZE) + 1 }:`, batchError);
          failedSends += currentBatch.length;
        }

        // Pausa entre lotes
        if ( (i / BATCH_SIZE) + 1 < totalBatches ) {
          console.log(`Esperando 3 segundos antes del siguiente lote de taller...`);
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }

      // Marcar como enviado en Firestore
      await admin.firestore().collection("workshops").doc(event.params.workshopId).update({
        invitationSent: true,
        invitationSentAt: admin.firestore.FieldValue.serverTimestamp(),
        invitationStats: {
          totalSent: successfulSends,
          totalFailed: failedSends,
          totalRecipients: recipients.length
        }
      });

      console.log(`Invitaciones de taller completadas. Enviadas: ${successfulSends}, Fallidas: ${failedSends}`);

    } catch (error) {
      console.error("Error al enviar invitaciones de taller:", error);
    }
  }
); 