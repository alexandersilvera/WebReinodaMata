/**
 * Configuración de Mailgun para Firebase Functions
 * Este archivo maneja las credenciales de Mailgun de forma segura
 */

import { defineString } from 'firebase-functions/params';

// Definir parámetros de configuración de Mailgun
export const MAILGUN_DOMAIN = defineString('mailgun_domain', {
  description: 'Dominio de Mailgun para envío de emails',
  default: 'mg.centroumbandistareinodamata.org'
});

export const MAILGUN_API_KEY = defineString('mailgun_api_key', {
  description: 'API Key de Mailgun'
});

export const MAILGUN_FROM_EMAIL = defineString('mailgun_from_email', {
  description: 'Email de origen para envíos',
  default: 'noreply@centroumbandistareinodamata.org'
});

export const MAILGUN_FROM_NAME = defineString('mailgun_from_name', {
  description: 'Nombre de origen para envíos',
  default: 'Centro Umbandista Reino Da Mata'
});

// URLs permitidas para CORS
export const ALLOWED_ORIGINS = defineString('allowed_origins', {
  description: 'Orígenes permitidos para CORS separados por coma',
  default: 'http://localhost:4321,https://reino-da-mata-2fea3.web.app,https://reino-da-mata-2fea3.firebaseapp.com,https://centroumbandistareinodamata.org'
});

// Emails de administradores configurables
export const ADMIN_EMAILS = defineString('admin_emails', {
  description: 'Emails de administradores separados por comas',
  default: 'administrador@centroumbandistareinodamata.org'
});

/**
 * Configuración de Mailgun compilada
 */
export interface MailgunConfig {
  domain: string;
  apiKey: string;
  fromEmail: string;
  fromName: string;
  baseUrl: string;
}

/**
 * Obtiene la configuración de Mailgun de forma segura
 */
export function getMailgunConfig(): MailgunConfig {
  const apiKey = MAILGUN_API_KEY.value();
  
  if (!apiKey) {
    throw new Error('MAILGUN_API_KEY no está configurado. Ejecuta: firebase functions:config:set mailgun_api_key="tu-api-key"');
  }

  if (!apiKey.startsWith('key-')) {
    throw new Error('MAILGUN_API_KEY debe comenzar con "key-"');
  }

  return {
    domain: MAILGUN_DOMAIN.value(),
    apiKey,
    fromEmail: MAILGUN_FROM_EMAIL.value(),
    fromName: MAILGUN_FROM_NAME.value(),
    baseUrl: 'https://api.mailgun.net/v3'
  };
}

/**
 * Obtiene los orígenes permitidos para CORS
 */
export function getAllowedOrigins(): string[] {
  return ALLOWED_ORIGINS.value().split(',').map(origin => origin.trim());
}

/**
 * Valida que un email tenga formato válido
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Limpia y valida una lista de emails
 */
export function validateEmailList(emails: string[]): string[] {
  return emails
    .map(email => email.trim().toLowerCase())
    .filter(email => email.length > 0 && isValidEmail(email));
}

/**
 * Verifica si un usuario es administrador usando configuración de Firebase Functions
 */
export function isAdminUser(email: string): boolean {
  const adminEmailsString = ADMIN_EMAILS.value();
  const adminEmails = adminEmailsString.split(',').map(email => email.trim().toLowerCase());
  return adminEmails.includes(email.toLowerCase());
} 