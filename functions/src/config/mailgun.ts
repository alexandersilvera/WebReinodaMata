/**
 * Configuración de Mailgun para Firebase Functions
 * Este archivo maneja las credenciales de Mailgun de forma segura
 */

import * as functions from 'firebase-functions';

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

/**
 * Obtiene la configuración de Mailgun desde Firebase Functions config
 */
export function getMailgunConfig(): MailgunConfig {
  const config = functions.config();
  
  // Usar la configuración legacy de Firebase Functions
  const apiKey = config.mailgun?.api_key || config.mailgun?.key;
  const domain = config.mailgun?.domain;
  const fromEmail = config.mailgun?.from_email || 'noreply@centroumbandistareinodamata.org';
  const fromName = config.mailgun?.from_name || 'Centro Umbandista Reino Da Mata';
  
  if (!apiKey) {
    throw new Error('MAILGUN_API_KEY no está configurado. Ejecuta: firebase functions:config:set mailgun.api_key="tu-api-key"');
  }

  if (!domain) {
    throw new Error('MAILGUN_DOMAIN no está configurado. Ejecuta: firebase functions:config:set mailgun.domain="tu-dominio"');
  }

  return {
    domain,
    apiKey,
    fromEmail,
    fromName,
    baseUrl: 'https://api.mailgun.net/v3'
  };
}

/**
 * Obtiene los orígenes permitidos para CORS
 */
export function getAllowedOrigins(): string[] {
  const config = functions.config();
  const origins = config.app?.allowed_origins || 'http://localhost:4321,https://centroumbandistareinodamata.vercel.app,https://www.centroumbandistareinodamata.org';
  return origins.split(',').map((origin: string) => origin.trim());
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
  const config = functions.config();
  const adminEmails = config.app?.admin_emails || 'admin@centroumbandistareinodamata.org,administrador@centroumbandistareinodamata.org';
  const admins = adminEmails.split(',').map((e: string) => e.trim().toLowerCase());
  return admins.includes(email.toLowerCase().trim());
}

/**
 * Obtiene la configuración de URL del sitio
 */
export function getSiteUrlConfig(): SiteUrlConfig {
  const config = functions.config();
  const url = config.app?.site_url || 'https://www.centroumbandistareinodamata.org';
  
  return { url };
}