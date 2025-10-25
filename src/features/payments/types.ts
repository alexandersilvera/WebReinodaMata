/**
 * Tipos para el sistema de pagos
 */

export type PaymentStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'refunded' | 'in_process';
export type PaymentType = 'subscription' | 'donation' | 'event_registration' | 'one_time';
export type PaymentMethodType = 'credit_card' | 'debit_card' | 'ticket' | 'bank_transfer' | 'other';

/**
 * Pago registrado
 */
export interface Payment {
  id: string;
  userId: string;
  userEmail: string;
  type: PaymentType;
  status: PaymentStatus;

  // Montos
  amount: number;
  currency: 'UYU' | 'USD' | 'ARS';
  netAmount?: number;             // Monto neto después de comisiones
  fee?: number;                   // Comisión de la pasarela

  // Datos de Mercado Pago
  mercadoPagoData?: {
    paymentId: number;
    preferenceId?: string;
    merchantOrderId?: number;
    paymentMethodId: string;
    paymentTypeId: PaymentMethodType;
    statusDetail: string;
    transactionAmount: number;
    dateApproved?: Date;
  };

  // Referencias
  subscriptionId?: string;        // Si es pago de suscripción
  donationId?: string;            // Si es donación
  eventRegistrationId?: string;   // Si es registro a evento

  // Metadata
  description: string;
  externalReference?: string;
  metadata?: Record<string, any>;

  // Fechas
  createdAt: Date;
  updatedAt: Date;
  paidAt?: Date;
}

/**
 * Preferencia de Mercado Pago
 */
export interface MercadoPagoPreference {
  id: string;
  init_point: string;              // URL de checkout
  sandbox_init_point?: string;     // URL de checkout en modo test

  items: Array<{
    title: string;
    description: string;
    quantity: number;
    unit_price: number;
    currency_id: 'UYU' | 'USD' | 'ARS';
  }>;

  payer?: {
    email: string;
    name?: string;
    surname?: string;
  };

  back_urls: {
    success: string;
    failure: string;
    pending: string;
  };

  auto_return: 'approved' | 'all';
  external_reference: string;
}

/**
 * Notificación de Mercado Pago (IPN/Webhook)
 */
export interface MercadoPagoNotification {
  id: number;
  live_mode: boolean;
  type: 'payment' | 'plan' | 'subscription' | 'invoice' | 'point_integration_wh';
  date_created: string;
  application_id: number;
  user_id: number;
  version: number;
  api_version: string;
  action: 'payment.created' | 'payment.updated' | 'subscription.created' | 'subscription.updated';
  data: {
    id: string;
  };
}

/**
 * Información de pago de Mercado Pago
 */
export interface MercadoPagoPayment {
  id: number;
  status: 'approved' | 'pending' | 'rejected' | 'cancelled' | 'refunded' | 'charged_back';
  status_detail: string;
  transaction_amount: number;
  currency_id: string;
  payment_method_id: string;
  payment_type_id: PaymentMethodType;
  date_created: string;
  date_approved?: string;
  date_last_updated: string;
  external_reference: string;
  payer: {
    id: string;
    email: string;
    identification?: {
      type: string;
      number: string;
    };
  };
  metadata?: Record<string, any>;
}

/**
 * Suscripción recurrente de Mercado Pago
 */
export interface MercadoPagoSubscription {
  id: string;
  payer_id: number;
  payer_email: string;
  back_url: string;
  collector_id: number;
  application_id: number;
  status: 'pending' | 'authorized' | 'paused' | 'cancelled';
  reason: string;
  external_reference: string;
  date_created: string;
  last_modified: string;
  init_point: string;
  preapproval_plan_id?: string;
  auto_recurring: {
    frequency: number;
    frequency_type: 'days' | 'months';
    transaction_amount: number;
    currency_id: string;
    start_date?: string;
    end_date?: string;
  };
  summarized: {
    quotas?: number;
    charged_quantity?: number;
    pending_charge_quantity?: number;
    charged_amount?: number;
    pending_charge_amount?: number;
    semaphore?: string;
  };
}

/**
 * Request para crear preferencia de pago
 */
export interface CreatePreferenceRequest {
  userId?: string;
  title?: string;
  description?: string;
  amount?: number;
  currency?: 'UYU' | 'USD';
  type?: PaymentType;
  paymentType?: PaymentType; // Alias para compatibilidad
  externalReference?: string;
  successUrl?: string;
  failureUrl?: string;
  pendingUrl?: string;
  metadata?: Record<string, any>;
  // Propiedades específicas para suscripciones
  planId?: string;
  billingPeriod?: 'monthly' | 'yearly';
  // Propiedades específicas para donaciones
  donorName?: string;
  donorEmail?: string;
  message?: string;
  // Propiedades específicas para eventos
  eventId?: string;
  participantName?: string;
  participantEmail?: string;
}

/**
 * Response de crear preferencia
 */
export interface CreatePreferenceResponse {
  preferenceId: string;
  initPoint: string;
  sandboxInitPoint?: string;
}
