/**
 * Cloud Function para crear preferencias de pago en Mercado Pago
 */

import { onCall, HttpsError } from "firebase-functions/v2/https";
import admin from 'firebase-admin';
import { MercadoPagoConfig, Preference } from 'mercadopago';


// Tipos
interface CreatePreferenceRequest {
  planId?: string;
  billingPeriod?: 'monthly' | 'yearly';
  userId?: string;
  paymentType: 'subscription' | 'donation' | 'event_registration' | 'one_time';
  amount?: number;
  donorName?: string;
  donorEmail?: string;
  message?: string;
  eventId?: string;
}

/**
 * Crear preferencia de pago en Mercado Pago
 */
export const createPaymentPreference = onCall(
  {
    region: 'us-central1',
    memory: '256MiB', // Asumiendo un valor razonable
    timeoutSeconds: 60, // Asumiendo un valor razonable
  },
  async (request) => {
    try {
      const data = request.data as CreatePreferenceRequest;
      const context = request;
      // Verificar autenticación para suscripciones
      if (data.paymentType === 'subscription' && !context.auth) {
        throw new HttpsError(
          'unauthenticated',
          'Debes estar autenticado para suscribirte'
        );
      }

      // Inicializar Mercado Pago
      const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
      if (!accessToken) {
        throw new HttpsError(
          'failed-precondition',
          'Mercado Pago no está configurado. Asegúrate de que MERCADOPAGO_ACCESS_TOKEN esté configurado en las variables de entorno.'
        );
      }

      const client = new MercadoPagoConfig({
        accessToken: accessToken,
      });
      const preferenceClient = new Preference(client);

      let preferenceData: any;
      let metadata: any = {
        paymentType: data.paymentType,
      };

      // Para desarrollo, usar una URL pública de ngrok o similar
      // Para producción, usar la URL real del sitio
      const appUrl = process.env.APP_URL || 'https://centroumbandistareinodamata.vercel.app';

      // Construir preferencia según el tipo de pago
      if (data.paymentType === 'subscription') {
        if (!data.planId || !data.billingPeriod || !data.userId) {
          throw new HttpsError(
            'invalid-argument',
            'Faltan datos requeridos: planId, billingPeriod, userId'
          );
        }

        // Obtener datos del plan
        const planDoc = await admin.firestore().collection('subscription_plans').doc(data.planId).get();
        if (!planDoc.exists) {
          throw new HttpsError('not-found', 'Plan no encontrado');
        }

        const plan = planDoc.data();
        const price =
          data.billingPeriod === 'monthly' ? plan!.price.monthly : plan!.price.yearly;

        metadata = {
          ...metadata,
          planId: data.planId,
          billingPeriod: data.billingPeriod,
          userId: data.userId,
        };

        preferenceData = {
          items: [
            {
              title: `Suscripción ${plan!.name} - ${data.billingPeriod === 'monthly' ? 'Mensual' : 'Anual'}`,
              description: plan!.description,
              quantity: 1,
              unit_price: price,
              currency_id: 'UYU',
            },
          ],
          payer: {
            email: context.auth?.token.email || '',
          },
          back_urls: {
            success: `${appUrl}/payment/success`,
            failure: `${appUrl}/payment/failure`,
            pending: `${appUrl}/payment/pending`,
          },
          auto_return: 'approved',
          external_reference: `sub_${data.userId}_${data.planId}_${Date.now()}`,
          notification_url: `${appUrl}/api/webhooks/mercadopago`,
          metadata: metadata,
          statement_descriptor: 'CENTRO UMBANDISTA',
        };
      } else if (data.paymentType === 'donation') {
        if (!data.amount || data.amount <= 0) {
          throw new HttpsError(
            'invalid-argument',
            'El monto de la donación debe ser mayor a 0'
          );
        }

        metadata = {
          ...metadata,
          donorName: data.donorName || 'Anónimo',
          donorEmail: data.donorEmail,
          message: data.message,
        };

        preferenceData = {
          items: [
            {
              title: 'Donación - Centro Umbandista Reino Da Mata',
              description: data.message || 'Donación voluntaria',
              quantity: 1,
              unit_price: data.amount,
              currency_id: 'UYU',
            },
          ],
          payer: {
            name: data.donorName || 'Anónimo',
            email: data.donorEmail || '',
          },
          back_urls: {
            success: `${appUrl}/donation/success`,
            failure: `${appUrl}/donation/failure`,
            pending: `${appUrl}/donation/pending`,
          },
          auto_return: 'approved',
          external_reference: `donation_${Date.now()}`,
          notification_url: `${appUrl}/api/webhooks/mercadopago`,
          metadata: metadata,
          statement_descriptor: 'DONACION CURDM',
        };
      } else if (data.paymentType === 'event_registration') {
        if (!data.eventId || !data.userId || !data.amount) {
          throw new HttpsError(
            'invalid-argument',
            'Faltan datos requeridos: eventId, userId, amount'
          );
        }

        metadata = {
          ...metadata,
          eventId: data.eventId,
          userId: data.userId,
        };

        preferenceData = {
          items: [
            {
              title: 'Registro a Evento Académico',
              description: `Inscripción al evento ${data.eventId}`,
              quantity: 1,
              unit_price: data.amount,
              currency_id: 'UYU',
            },
          ],
          payer: {
            email: context.auth?.token.email || '',
          },
          back_urls: {
            success: `${appUrl}/event/registration/success`,
            failure: `${appUrl}/event/registration/failure`,
            pending: `${appUrl}/event/registration/pending`,
          },
          auto_return: 'approved',
          external_reference: `event_${data.eventId}_${data.userId}_${Date.now()}`,
          notification_url: `${appUrl}/api/webhooks/mercadopago`,
          metadata: metadata,
          statement_descriptor: 'EVENTO CURDM',
        };
      } else {
        throw new HttpsError(
          'invalid-argument',
          'Tipo de pago no soportado'
        );
      }

      // Crear preferencia en Mercado Pago
      console.log('Creating preference with data:', JSON.stringify(preferenceData, null, 2));
      const preference = await preferenceClient.create({ body: preferenceData });

      // Guardar en Firestore para tracking
      await admin.firestore().collection('payment_preferences').add({
        preferenceId: preference.id,
        userId: data.userId || null,
        paymentType: data.paymentType,
        metadata: metadata,
        status: 'pending',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`✅ Preferencia creada exitosamente: ${preference.id}`);

      return {
        success: true,
        preference: {
          id: preference.id,
          init_point: preference.init_point,
          sandbox_init_point: preference.sandbox_init_point,
        },
      };
    } catch (error: any) {
      console.error('❌ Error creating payment preference:', error);

      if (error instanceof HttpsError) {
        throw error;
      }

      throw new HttpsError(
        'internal',
        'Error al crear la preferencia de pago: ' + error.message
      );
    }
  });
