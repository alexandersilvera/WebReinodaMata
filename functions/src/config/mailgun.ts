/**
 * Configuración de Mailgun para Firebase Functions v2
 * Este archivo maneja las credenciales de Mailgun usando variables de entorno
 */

import { defineString } from 'firebase-functions/params';

// Configuración de Mailgun
export interface MailgunConfig {
  domain: string;
  apiKey: string;
  fromEmail: string;
  fromName: string;
  baseUrl: string;
}

// Configuración del sitio
export interface SiteUrlConfig {
  url: string;
}

// Definir parámetros de configuración para Firebase Functions v2
const mailgunApiKey = defineString('MAILGUN_API_KEY');

const mailgunDomain = defineString('MAILGUN_DOMAIN', {
  default: 'centroumbandistareinodamata.org'
});

const mailgunFromEmail = defineString('MAILGUN_FROM_EMAIL', {
  default: 'noreply@centroumbandistareinodamata.org'
});

const mailgunFromName = defineString('MAILGUN_FROM_NAME', {
  default: 'Centro Umbandista Reino Da Mata'
});

/**
 * Obtiene la configuración de Mailgun usando variables de entorno v2
 */
export function getMailgunConfig(): MailgunConfig {
  return {
    domain: mailgunDomain.value(),
    apiKey: mailgunApiKey.value(),
    fromEmail: mailgunFromEmail.value(),
    fromName: mailgunFromName.value(),
    baseUrl: 'https://api.mailgun.net/v3'
  };
}

// Definir parámetros adicionales
const allowedOrigins = defineString('ALLOWED_ORIGINS', {
  default: 'http://localhost:4321,https://centroumbandistareinodamata.vercel.app,https://www.centroumbandistareinodamata.org'
});

const adminEmails = defineString('ADMIN_EMAILS', {
  default: 'admin@centroumbandistareinodamata.org,administrador@centroumbandistareinodamata.org,alexandersilvera@hotmail.com'
});

const siteUrl = defineString('SITE_URL', {
  default: 'https://www.centroumbandistareinodamata.org'
});

/**
 * Obtiene los orígenes permitidos para CORS
 */
export function getAllowedOrigins(): string[] {
  return allowedOrigins.value().split(',').map((origin: string) => origin.trim());
}

/**
 * Valida que un email tenga formato válido
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida una lista de emails
 */
export function validateEmailList(emails: string[]): string[] {
  const validEmails = emails.filter(email => {
    const trimmed = email.trim();
    return trimmed && isValidEmail(trimmed);
  });

  if (validEmails.length === 0) {
    throw new Error('No se encontraron emails válidos');
  }

  // Limitar a máximo 1000 destinatarios por lote
  return validEmails.slice(0, 1000);
}

/**
 * Verifica si un usuario es administrador
 */
export function isAdminUser(email: string): boolean {
  const admins = adminEmails.value().split(',').map((e: string) => e.trim().toLowerCase());
  return admins.includes(email.toLowerCase().trim());
}

/**
 * Obtiene la configuración de URL del sitio
 */
export function getSiteUrlConfig(): SiteUrlConfig {
  return { url: siteUrl.value() };
}