/**
 * Tipos para el sistema de eventos y certificados
 * Complementa los tipos existentes en src/features/research/types.ts
 */

export type EventRegistrationStatus = 'registered' | 'confirmed' | 'attended' | 'cancelled' | 'no_show';
export type CertificateStatus = 'pending' | 'issued' | 'revoked';

/**
 * Registro a un evento académico
 */
export interface EventRegistration {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  eventId: string;
  eventTitle: string;
  status: EventRegistrationStatus;

  // Datos de registro
  registrationDate: Date;
  confirmationDate?: Date;
  attendanceDate?: Date;
  cancellationDate?: Date;
  cancellationReason?: string;

  // Datos adicionales del participante
  additionalInfo?: {
    phone?: string;
    institution?: string;
    role?: string;
    interests?: string[];
    specialRequirements?: string;
  };

  // Certificado
  certificateId?: string;
  certificateIssued: boolean;

  // Pago (si el evento es pago)
  paymentId?: string;
  paymentRequired: boolean;
  paymentStatus?: 'pending' | 'paid' | 'refunded';

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Certificado digital
 */
export interface Certificate {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;

  // Evento relacionado
  eventId: string;
  eventTitle: string;
  eventDate: Date;
  eventDuration: number;          // Horas

  // Datos del certificado
  certificateNumber: string;      // Número único
  verificationCode: string;       // Código QR para verificación
  status: CertificateStatus;

  // URLs
  pdfUrl?: string;                // URL del PDF en Firebase Storage
  verificationUrl: string;        // URL pública de verificación

  // Firma digital
  issuedBy: string;               // Nombre del firmante
  issuerTitle: string;            // Cargo del firmante
  institutionName: string;        // Nombre de la institución

  // Template usado
  templateId?: string;
  templateVersion?: string;

  // Metadata
  issuedAt: Date;
  revokedAt?: Date;
  revokedReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Verificación pública de certificado
 */
export interface CertificateVerification {
  verificationCode: string;
  certificateId: string;
  isValid: boolean;
  certificate?: {
    userName: string;
    eventTitle: string;
    eventDate: Date;
    certificateNumber: string;
    issuedAt: Date;
  };
}

/**
 * Template de certificado
 */
export interface CertificateTemplate {
  id: string;
  name: string;
  description: string;
  version: string;

  // Diseño
  backgroundColor: string;
  borderColor: string;
  headerImageUrl?: string;
  logoUrl?: string;

  // Texto
  title: string;
  bodyTemplate: string;          // Template con placeholders
  footerText: string;

  // Firma
  signatureImageUrl?: string;
  signerName: string;
  signerTitle: string;

  isActive: boolean;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Request para generar certificado
 */
export interface GenerateCertificateRequest {
  userId: string;
  eventId: string;
  registrationId: string;
  templateId?: string;
}

/**
 * Response de generar certificado
 */
export interface GenerateCertificateResponse {
  certificateId: string;
  pdfUrl: string;
  verificationUrl: string;
  verificationCode: string;
}

/**
 * Estadísticas de eventos
 */
export interface EventStatistics {
  eventId: string;
  totalRegistrations: number;
  confirmedAttendees: number;
  actualAttendees: number;
  cancelledRegistrations: number;
  noShows: number;
  certificatesIssued: number;
  averageRating?: number;
  revenue?: number;
}
