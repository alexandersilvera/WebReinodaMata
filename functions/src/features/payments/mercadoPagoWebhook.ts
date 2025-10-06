/**
 * Webhook para recibir notificaciones de Mercado Pago
 *
 * TODO: Esta es una implementación simplificada.
 * Completar en próxima iteración con:
 * - Validación de firma de webhook
 * - Procesamiento de notificaciones de pago
 * - Activación automática de suscripciones
 * - Registro de donaciones
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const mercadoPagoWebhook = functions
  .region('us-central1')
  .https.onRequest(async (req, res) => {
    // Implementación pendiente - requiere configuración de Mercado Pago
    console.log('Mercado Pago Webhook received (not implemented):', req.body);
    res.status(200).send('Webhook received (implementation pending)');
  });
