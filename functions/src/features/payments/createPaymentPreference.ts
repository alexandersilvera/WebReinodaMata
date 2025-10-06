/**
 * Cloud Function para crear preferencias de pago en Mercado Pago
 *
 * TODO: Esta es una implementación simplificada.
 * Completar en próxima iteración con toda la lógica de:
 * - Validación de autenticación
 * - Creación de preferencias según tipo de pago (subscription, donation, event)
 * - Integración completa con SDK de Mercado Pago
 * - Guardado de preferencias en Firestore
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const createPaymentPreference = functions
  .region('us-central1')
  .https.onCall(async (data, context) => {
    // Implementación pendiente - requiere configuración de Mercado Pago
    throw new functions.https.HttpsError(
      'unimplemented',
      'Función en desarrollo - Configurar access token de Mercado Pago primero'
    );
  });
