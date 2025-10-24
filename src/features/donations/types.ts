/**
 * Tipos para el sistema de donaciones
 */

export type DonationType = 'one_time' | 'recurring';
export type DonationStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
export type RecurrenceFrequency = 'monthly' | 'quarterly' | 'yearly';

/**
 * Donación
 */
export interface Donation {
  id: string;

  // Donante
  userId?: string;                 // Si está registrado
  donorEmail: string;
  donorName: string;
  isAnonymous: boolean;

  // Tipo y monto
  type: DonationType;
  amount: number;
  currency: 'UYU' | 'USD';
  status: DonationStatus;

  // Recurrencia (si aplica)
  recurrence?: {
    frequency: RecurrenceFrequency;
    startDate: Date;
    endDate?: Date;
    nextPaymentDate?: Date;
    totalPayments?: number;
    completedPayments: number;
    isActive: boolean;
  };

  // Mercado Pago
  mercadoPagoData?: {
    paymentId?: number;
    preferenceId?: string;
    subscriptionId?: string;        // Para donaciones recurrentes
    paymentStatus: string;
  };

  // Mensaje y dedicatoria
  message?: string;
  dedication?: {
    inHonorOf?: string;
    inMemoryOf?: string;
  };

  // Campaña asociada
  campaignId?: string;

  // Recibo fiscal
  needsReceipt: boolean;
  receiptData?: {
    taxId: string;                  // RUT o CI
    legalName: string;
    address: string;
    receiptUrl?: string;
  };

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

/**
 * Muro de donantes
 */
export interface DonorWallEntry {
  id: string;
  donorName: string;
  amount?: number;                  // Opcional, puede ser privado
  currency: 'UYU' | 'USD';
  message?: string;
  badge?: 'bronce' | 'plata' | 'oro' | 'platino';
  donationDate: Date;
  isRecurring: boolean;
  totalDonated?: number;            // Total acumulado
  createdAt: Date;
}

/**
 * Campaña de donación
 */
export interface DonationCampaign {
  id: string;
  title: string;
  description: string;
  goal: number;
  currency: 'UYU' | 'USD';
  currentAmount: number;
  donorCount: number;

  // Período
  startDate: Date;
  endDate: Date;
  isActive: boolean;

  // Visuals
  imageUrl?: string;
  videoUrl?: string;

  // Propósito
  purpose: string;
  milestones?: Array<{
    amount: number;
    description: string;
    isReached: boolean;
  }>;

  // Metadata
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Request para crear donación
 */
export interface CreateDonationRequest {
  amount: number;
  currency: 'UYU' | 'USD';
  type: DonationType;
  donorEmail: string;
  donorName: string;
  isAnonymous?: boolean;
  message?: string;
  campaignId?: string;
  recurrence?: {
    frequency: RecurrenceFrequency;
  };
  needsReceipt?: boolean;
  receiptData?: {
    taxId: string;
    legalName: string;
    address: string;
  };
}

/**
 * Response de crear donación
 */
export interface CreateDonationResponse {
  donationId: string;
  preferenceId?: string;
  initPoint?: string;
  status: DonationStatus;
}

/**
 * Estadísticas de donaciones
 */
export interface DonationStatistics {
  totalDonations: number;
  totalAmount: number;
  currency: 'UYU' | 'USD';
  totalDonors: number;
  recurringDonors: number;
  oneTimeDonors: number;
  averageDonation: number;
  largestDonation: number;
  byMonth: Record<string, {
    amount: number;
    count: number;
  }>;
  byCampaign?: Record<string, {
    amount: number;
    count: number;
    goalProgress: number;
  }>;
  topDonors: Array<{
    name: string;
    amount: number;
    isRecurring: boolean;
  }>;
}

/**
 * Niveles de reconocimiento por donación
 */
export interface DonorBadgeLevel {
  badge: 'bronce' | 'plata' | 'oro' | 'platino';
  minAmount: number;
  benefits: string[];
  displayName: string;
}
