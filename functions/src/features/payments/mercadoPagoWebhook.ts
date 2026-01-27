/**
 * Webhook para recibir notificaciones de Mercado Pago
 */

import { onRequest } from "firebase-functions/v2/https";
import * as admin from 'firebase-admin';
import { MercadoPagoConfig, Payment } from 'mercadopago';


interface WebhookNotification {
  action: string;
  api_version: string;
  data: {
    id: string;
  };
  date_created: string;
  id: number;
  live_mode: boolean;
  type: string;
  user_id: string;
}

/**
 * Webhook para notificaciones de Mercado Pago
 */
export const mercadoPagoWebhook = onRequest(
  {
    region: 'us-central1',
    memory: '256MiB', // Asumiendo un valor razonable
    timeoutSeconds: 60, // Asumiendo un valor razonable
  },
  async (req, res) => {
    try {
      // Solo aceptar POST
      if (req.method !== 'POST') {
        res.status(405).send('Method not allowed');
        return;
      }

      const notification: WebhookNotification = req.body;

      console.log('🔔 Mercado Pago Webhook received:', JSON.stringify(notification, null, 2));

      // Validar que sea una notificación de pago
      if (notification.type !== 'payment') {
        console.log('ℹ️  Notification type not payment, ignoring');
        res.status(200).send('OK');
        return;
      }

      // Inicializar Mercado Pago
      const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
      if (!accessToken) {
        console.error('❌ Mercado Pago access token not configured');
        res.status(500).send('Configuration error');
        return;
      }

      const client = new MercadoPagoConfig({
        accessToken: accessToken,
      });
      const paymentClient = new Payment(client);

      // Obtener información del pago
      const paymentId = notification.data.id;
      console.log(`📥 Fetching payment details for ID: ${paymentId}`);

      const payment = await paymentClient.get({ id: paymentId });

      console.log('💳 Payment details:', {
        id: payment.id,
        status: payment.status,
        amount: payment.transaction_amount,
        externalReference: payment.external_reference,
      });

      // Guardar registro del pago
      const paymentData = {
        mercadoPagoId: payment.id,
        status: payment.status,
        statusDetail: payment.status_detail,
        amount: payment.transaction_amount,
        currency: payment.currency_id,
        paymentMethod: payment.payment_method_id,
        paymentType: payment.payment_type_id,
        externalReference: payment.external_reference,
        metadata: payment.metadata || {},
        payerEmail: payment.payer?.email,
        payerName: payment.payer?.first_name
          ? `${payment.payer.first_name} ${payment.payer.last_name || ''}`.trim()
          : undefined,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      // Guardar en Firestore
      await admin.firestore().collection('payments').doc(paymentId).set(paymentData, { merge: true });
      console.log(`✅ Payment saved to Firestore: ${paymentId}`);

      // Procesar según el tipo de pago y estado
      if (payment.status === 'approved') {
        console.log('✅ Payment approved, processing...');
        const metadata = payment.metadata as any;

        if (metadata.paymentType === 'subscription') {
          await activateSubscription(
            metadata.userId,
            metadata.planId,
            metadata.billingPeriod,
            paymentId
          );
        } else if (metadata.paymentType === 'donation') {
          await recordDonation(
            payment.transaction_amount!,
            metadata.donorName,
            metadata.donorEmail,
            metadata.message,
            paymentId
          );
        } else if (metadata.paymentType === 'event_registration') {
          await registerToEvent(
            metadata.userId,
            metadata.eventId,
            paymentId
          );
        }
      } else if (payment.status === 'rejected') {
        console.log('❌ Payment rejected');
      } else if (payment.status === 'pending') {
        console.log('⏳ Payment pending');
      }

      res.status(200).send('OK');
    } catch (error: any) {
      console.error('❌ Error processing webhook:', error);
      res.status(500).send('Internal server error');
    }
  });

/**
 * Activar suscripción del usuario
 */
async function activateSubscription(
  userId: string,
  planId: string,
  billingPeriod: 'monthly' | 'yearly',
  paymentId: string
): Promise<void> {
  try {
    console.log(`🔄 Activating subscription for user ${userId}, plan ${planId}`);

    const now = new Date();
    const periodEnd = new Date();

    // Calcular fecha de vencimiento
    if (billingPeriod === 'monthly') {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    } else {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    }

    // Obtener plan
    const planDoc = await admin.firestore().collection('subscription_plans').doc(planId).get();
    if (!planDoc.exists) {
      throw new Error(`Plan ${planId} not found`);
    }
    const plan = planDoc.data();

    // Crear o actualizar suscripción
    const subscriptionData = {
      userId,
      planId,
      planType: plan!.type,
      status: 'active',
      billingPeriod,
      paymentMethod: 'mercadopago',
      mercadoPagoData: {
        lastPaymentId: paymentId,
      },
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Buscar suscripción existente del usuario
    const existingSubscription = await admin.firestore()
      .collection('subscriptions')
      .where('userId', '==', userId)
      .where('status', '==', 'active')
      .limit(1)
      .get();

    if (!existingSubscription.empty) {
      // Actualizar suscripción existente
      await existingSubscription.docs[0].ref.update(subscriptionData);
      console.log(`✅ Subscription updated for user ${userId}`);
    } else {
      // Crear nueva suscripción
      await admin.firestore().collection('subscriptions').add({
        ...subscriptionData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log(`✅ Subscription created for user ${userId}`);
    }
  } catch (error) {
    console.error('❌ Error activating subscription:', error);
    throw error;
  }
}

/**
 * Registrar donación
 */
async function recordDonation(
  amount: number,
  donorName?: string,
  donorEmail?: string,
  message?: string,
  paymentId?: string
): Promise<void> {
  try {
    console.log(`💰 Recording donation: ${amount} UYU from ${donorName || 'Anonymous'}`);

    const donationData = {
      amount,
      currency: 'UYU',
      donorName: donorName || 'Anónimo',
      donorEmail: donorEmail || null,
      message: message || null,
      paymentId: paymentId || null,
      status: 'completed',
      isAnonymous: !donorName || donorName === 'Anónimo',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await admin.firestore().collection('donations').add(donationData);

    // Agregar al muro de donantes si no es anónimo
    if (!donationData.isAnonymous) {
      await admin.firestore().collection('donor_wall').add({
        name: donorName,
        amount: amount,
        message: message || null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log(`✅ Added to donor wall: ${donorName}`);
    }

    console.log(`✅ Donation recorded successfully`);
  } catch (error) {
    console.error('❌ Error recording donation:', error);
    throw error;
  }
}

/**
 * Registrar usuario a evento
 */
async function registerToEvent(
  userId: string,
  eventId: string,
  paymentId: string
): Promise<void> {
  try {
    console.log(`📅 Registering user ${userId} to event ${eventId}`);

    const registrationData = {
      userId,
      eventId,
      status: 'confirmed',
      paymentId,
      registrationDate: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await admin.firestore().collection('event_registrations').add(registrationData);
    console.log(`✅ User registered to event successfully`);
  } catch (error) {
    console.error('❌ Error registering to event:', error);
    throw error;
  }
}
