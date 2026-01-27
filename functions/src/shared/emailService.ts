// functions/src/shared/emailService.ts
import Mailgun from 'mailgun.js';
import FormData from 'form-data';
import { getMailgunConfig } from '../config/mailgun.js'; // Importar la configuración de Mailgun

// Inicializar Mailgun
const mailgun = new Mailgun(FormData);
let mg: any | null = null;
let mailgunConfig: ReturnType<typeof getMailgunConfig> | null = null;

function initializeMailgunClient() {
  if (!mg) {
    mailgunConfig = getMailgunConfig();
    if (!mailgunConfig.apiKey || !mailgunConfig.domain) {
      console.error('Mailgun API Key or Domain not configured. Email service will not function.');
      return;
    }
    mg = mailgun.client({
      username: 'api',
      key: mailgunConfig.apiKey,
      url: mailgunConfig.baseUrl,
    });
  }
}

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(data: EmailData): Promise<void> {
  initializeMailgunClient();

  if (!mg || !mailgunConfig) {
    console.error('Mailgun client not initialized. Skipping email.');
    return;
  }

  const messageData = {
    from: `${mailgunConfig.fromName} <${mailgunConfig.fromEmail}>`,
    to: data.to,
    subject: data.subject,
    html: data.html,
    text: data.text || '',
  };

  try {
    await mg.messages.create(mailgunConfig.domain, messageData);
    console.log(`Email enviado a ${data.to} con asunto: ${data.subject}`);
  } catch (error) {
    console.error(`Error al enviar email a ${data.to}:`, error);
    throw new Error('Failed to send email.');
  }
}

export interface EventRegistrationEmailData {
  to: string;
  userName: string;
  eventTitle: string;
  registrationId: string;
  eventDate: string; // Formato legible para el usuario
  eventTime: string; // Formato legible para el usuario
  eventLocation: string;
  isFree: boolean;
  paymentStatus?: string;
  // Otros datos relevantes para el correo
}

export async function sendEventRegistrationConfirmationEmail(data: EventRegistrationEmailData): Promise<void> {
  initializeMailgunClient(); // Asegurarse de que el cliente de Mailgun esté inicializado

  if (!mailgunConfig) {
    console.error('Mailgun configuration not available. Cannot send confirmation email.');
    throw new Error('Mailgun configuration missing.');
  }

  const subject = `Confirmación de Registro: ${data.eventTitle}`;
  const paymentInfo = data.isFree
    ? '<p>Este evento es gratuito.</p>'
    : `<p>Estado del pago: <strong>${data.paymentStatus || 'Pendiente'}</strong></p>`;

  const htmlContent = `
    <h1>Confirmación de Registro al Evento: ${data.eventTitle}</h1>
    <p>Hola ${data.userName},</p>
    <p>Gracias por registrarte en nuestro evento "${data.eventTitle}".</p>
    <p><strong>Detalles del Evento:</strong></p>
    <ul>
      <li><strong>Fecha:</strong> ${data.eventDate}</li>
      <li><strong>Hora:</strong> ${data.eventTime}</li>
      <li><strong>Lugar:</strong> ${data.eventLocation}</li>
    </ul>
    <p>Tu ID de registro es: <strong>${data.registrationId}</strong></p>
    ${paymentInfo}
    <p>¡Esperamos verte allí!</p>
    <p>Saludos,</p>
    <p>${mailgunConfig.fromName}</p>
  `;

  await sendEmail({
    to: data.to,
    subject: subject,
    html: htmlContent,
    text: `Hola ${data.userName},\n\nGracias por registrarte en nuestro evento "${data.eventTitle}".\n\nTu ID de registro es: ${data.registrationId}\n\nFecha: ${data.eventDate}\nHora: ${data.eventTime}\nLugar: ${data.eventLocation}\n\n¡Esperamos verte allí!\n\nSaludos,\n${mailgunConfig.fromName}`,
  });
}
