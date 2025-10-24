/**
 * Tipos para el sistema de suscripciones
 */

export type SubscriptionPlanType = 'free' | 'colaborador' | 'investigador' | 'institucion';
export type BillingPeriod = 'monthly' | 'yearly';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'suspended' | 'pending' | 'trial';

/**
 * Plan de suscripción
 */
export interface SubscriptionPlan {
  id: string;
  name: string;
  type: SubscriptionPlanType;
  description: string;
  features: string[];
  price: {
    monthly: number;
    yearly: number;
    currency: 'UYU' | 'USD';
  };
  limits: {
    maxEvents?: number;           // Eventos por mes
    maxPaperDownloads?: number;   // Descargas de papers por mes
    storageGB?: number;            // GB de almacenamiento
    maxProjects?: number;          // Proyectos de investigación
    licenses?: number;             // Número de licencias (para instituciones)
  };
  highlights: string[];            // Features destacadas
  isPopular?: boolean;
  isActive: boolean;
  order: number;                   // Orden de visualización
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Suscripción activa de un usuario
 */
export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  planType: SubscriptionPlanType;
  status: SubscriptionStatus;
  billingPeriod: BillingPeriod;
  paymentMethod: 'mercadopago' | 'manual';

  // Datos de Mercado Pago
  mercadoPagoData?: {
    subscriptionId?: string;      // ID de suscripción recurrente MP
    preapprovalId?: string;        // ID de preaprobación MP
    payerId: string;               // ID del pagador en MP
    lastPaymentId?: number;        // Último pago procesado
    paymentMethodId?: string;      // Método de pago guardado
  };

  // Período actual
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  trialEnd?: Date;

  // Control de cancelación
  cancelAtPeriodEnd: boolean;
  canceledAt?: Date;
  cancelReason?: string;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Beneficios y accesos por tipo de plan
 */
export interface PlanBenefits {
  canAccessPremiumPapers: boolean;
  canRegisterToEvents: boolean;
  canParticipateInProjects: boolean;
  canGetCertificates: boolean;
  canAccessMentorship: boolean;
  maxEventRegistrations: number;
  maxPaperDownloads: number;
  hasEarlyAccess: boolean;
  hasPrioritySupport: boolean;
}

/**
 * Request para crear una suscripción
 */
export interface CreateSubscriptionRequest {
  userId: string;
  planId: string;
  billingPeriod: BillingPeriod;
  paymentMethod: 'mercadopago';
  successUrl?: string;
  failureUrl?: string;
}

/**
 * Response de crear suscripción
 */
export interface CreateSubscriptionResponse {
  subscriptionId: string;
  preferenceId?: string;         // Para Mercado Pago
  initPoint?: string;             // URL de checkout
  status: SubscriptionStatus;
}
