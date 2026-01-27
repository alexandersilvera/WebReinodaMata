/**
 * Utilidades para manejar plantillas de email HTML
 */

import * as path from "path";
import * as fs from "fs";
import { getSiteUrlConfig } from "../config/mailgun.js";

export interface EmailTemplateData {
  subject?: string;
  content?: string;
  firstName?: string;
  unsubscribeLink?: string;
  callToAction?: string;
  siteUrl?: string;
}

/**
 * Procesa una plantilla HTML reemplazando variables
 */
export function processTemplate(templateContent: string, data: EmailTemplateData): string {
  let processed = templateContent;
  
  // Optimizar contenido para deliverability
  const optimizedContent = data.content ? optimizeContentForDeliverability(data.content) : '';
  const optimizedSubject = data.subject ? optimizeContentForDeliverability(data.subject) : '';
  
  // Reemplazar variables básicas
  processed = processed.replace(/\{\{subject\}\}/g, optimizedSubject);
  processed = processed.replace(/\{\{content\}\}/g, optimizedContent);
  processed = processed.replace(/\{\{firstName\}\}/g, data.firstName || 'Suscriptor');
  processed = processed.replace(/\{\{siteUrl\}\}/g, data.siteUrl || getSiteUrlConfig().url);
  
  // Procesar call to action (opcional)
  if (data.callToAction) {
    processed = processed.replace(/\{\{callToAction\}\}/g, data.callToAction);
  } else {
    processed = processed.replace(/\{\{callToAction\}\}/g, '');
  }
  
  // Procesar unsubscribe link
  if (data.unsubscribeLink) {
    const unsubscribeParagraph = `Si deseas cancelar tu suscripción, <a href="${data.unsubscribeLink}" style="color: #4a7c2a; text-decoration: none;">haz clic aquí</a>.`;
    processed = processed.replace(/\{\{unsubscribeParagraph\}\}/g, unsubscribeParagraph);
    processed = processed.replace(/\{\{unsubscribeLink\}\}/g, `<a href="${data.unsubscribeLink}" style="color: #999; font-size: 12px; text-decoration: none;">Cancelar suscripción</a>`);
  } else {
    processed = processed.replace(/\{\{unsubscribeParagraph\}\}/g, 'Si deseas cancelar tu suscripción en cualquier momento, puedes hacerlo desde nuestro sitio web.');
    processed = processed.replace(/\{\{unsubscribeLink\}\}/g, '');
  }
  
  return processed;
}

/**
 * Carga y procesa una plantilla de email
 */
export function loadEmailTemplate(templateName: string, data: EmailTemplateData): string {
  try {
    const templatePath = path.join(__dirname, '../templates', `${templateName}.html`);
    const templateContent = fs.readFileSync(templatePath, 'utf8');
    return processTemplate(templateContent, data);
  } catch (error) {
    console.error(`Error cargando plantilla ${templateName}:`, error);
    
    // Fallback a HTML básico
    return generateFallbackHtml(data);
  }
}

/**
 * Mejora el contenido para evitar filtros de spam
 */
function optimizeContentForDeliverability(content: string): string {
  // Evitar palabras que triggean spam filters
  const spamWords = ['URGENTE', 'GRATIS', 'OFERTA LIMITADA', '100% GRATIS', 'CLICK AQUÍ'];
  let optimized = content;
  
  spamWords.forEach(word => {
    const regex = new RegExp(word, 'gi');
    optimized = optimized.replace(regex, word.toLowerCase());
  });
  
  return optimized;
}

/**
 * Genera HTML de fallback cuando falla la carga de plantillas
 */
function generateFallbackHtml(data: EmailTemplateData): string {
  const siteUrl = data.siteUrl || getSiteUrlConfig().url;
  
  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.subject || 'Newsletter'} - Centro Umbandista Reino Da Mata</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td style="padding: 20px 0;">
                <table style="width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px;">
                    <tr>
                        <td style="background-color: #2d5016; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                            <h1 style="margin: 0; font-size: 24px;">Centro Umbandista Reino Da Mata</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 30px;">
                            ${data.subject ? `<h2 style="color: #2d5016; margin-bottom: 20px;">${data.subject}</h2>` : ''}
                            <div style="color: #333; line-height: 1.6; margin-bottom: 30px;">
                                ${data.content || ''}
                            </div>
                            <p style="color: #2d5016; font-weight: 600;">¡Axé!</p>
                            <p style="color: #666; font-size: 14px;">Centro Umbandista Reino Da Mata</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #f8f8f8; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
                            <p style="color: #999; font-size: 12px; margin: 0;">
                                Centro Umbandista Reino Da Mata<br>
                                ${siteUrl}
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
}

/**
 * Formatea contenido de texto para HTML
 * Convierte saltos de línea a párrafos y aplica formato básico
 */
export function formatContentForHtml(content: string): string {
  if (!content) return '';
  
  // Dividir en párrafos por dobles saltos de línea
  const paragraphs = content.split(/\n\s*\n/);
  
  return paragraphs
    .map(paragraph => {
      // Limpiar el párrafo
      const cleaned = paragraph.trim().replace(/\n/g, ' ');
      if (cleaned) {
        return `<p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">${cleaned}</p>`;
      }
      return '';
    })
    .filter(p => p)
    .join('');
}

/**
 * Crea un botón de call-to-action
 */
export function createCallToAction(text: string, url: string): string {
  return `
<div style="text-align: center; margin: 30px 0;">
    <a href="${url}" style="
        display: inline-block;
        background: linear-gradient(135deg, #4a7c2a 0%, #2d5016 100%);
        color: white;
        text-decoration: none;
        padding: 15px 30px;
        border-radius: 6px;
        font-weight: 600;
        font-size: 16px;
        box-shadow: 0 3px 12px rgba(45, 80, 22, 0.3);
        transition: all 0.3s ease;
    ">${text}</a>
</div>`;
}