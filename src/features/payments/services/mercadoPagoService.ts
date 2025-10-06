/**
 * Servicio para interactuar con Mercado Pago
 */

import type {
  MercadoPagoPreference,
  CreatePaymentPreferenceRequest,
  PaymentStatus,
} from '../types';
import { functions } from '@/core/firebase/config';
import { httpsCallable } from 'firebase/functions';

export class MercadoPagoService {
  /**
   * Crear una preferencia de pago para una suscripción
   */
  static async createSubscriptionPreference(
    planId: string,
    billingPeriod: 'monthly' | 'yearly',
    userId: string
  ): Promise<MercadoPagoPreference> {
    try {
      const createPreference = httpsCallable(functions, 'createPaymentPreference');

      const request: CreatePaymentPreferenceRequest = {
        planId,
        billingPeriod,
        userId,
        paymentType: 'subscription',
      };

      const result = await createPreference(request);
      const data = result.data as { preference: MercadoPagoPreference };

      return data.preference;
    } catch (error) {
      console.error('Error creating payment preference:', error);
      throw new Error('No se pudo crear la preferencia de pago');
    }
  }

  /**
   * Crear una preferencia de pago para una donación
   */
  static async createDonationPreference(
    amount: number,
    donorName?: string,
    donorEmail?: string,
    message?: string
  ): Promise<MercadoPagoPreference> {
    try {
      const createPreference = httpsCallable(functions, 'createPaymentPreference');

      const request: CreatePaymentPreferenceRequest = {
        paymentType: 'donation',
        amount,
        donorName,
        donorEmail,
        message,
      };

      const result = await createPreference(request);
      const data = result.data as { preference: MercadoPagoPreference };

      return data.preference;
    } catch (error) {
      console.error('Error creating donation preference:', error);
      throw new Error('No se pudo crear la preferencia de donación');
    }
  }

  /**
   * Verificar el estado de un pago
   */
  static async checkPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    try {
      const checkPayment = httpsCallable(functions, 'checkPaymentStatus');
      const result = await checkPayment({ paymentId });
      const data = result.data as { status: PaymentStatus };

      return data.status;
    } catch (error) {
      console.error('Error checking payment status:', error);
      throw new Error('No se pudo verificar el estado del pago');
    }
  }

  /**
   * Obtener la URL de checkout de Mercado Pago
   */
  static getCheckoutUrl(preferenceId: string, sandbox: boolean = false): string {
    const baseUrl = sandbox
      ? 'https://sandbox.mercadopago.com.uy/checkout/v1/redirect'
      : 'https://www.mercadopago.com.uy/checkout/v1/redirect';

    return `${baseUrl}?pref_id=${preferenceId}`;
  }

  /**
   * Redirigir al usuario al checkout de Mercado Pago
   */
  static redirectToCheckout(preference: MercadoPagoPreference, sandbox: boolean = false): void {
    const checkoutUrl = preference.init_point || this.getCheckoutUrl(preference.id, sandbox);
    window.location.href = checkoutUrl;
  }
}
