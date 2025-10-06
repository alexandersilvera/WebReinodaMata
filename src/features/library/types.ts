/**
 * Tipos para la biblioteca digital
 */

export type AccessLevel = 'public' | 'colaborador' | 'investigador' | 'institucion' | 'admin';
export type PaperCategory = 'racism' | 'human-rights' | 'anthropology' | 'history' | 'sociology' | 'religion' | 'other';
export type PaperLanguage = 'es' | 'en' | 'pt';

/**
 * Documento/Paper en la biblioteca digital
 */
export interface DigitalLibraryPaper {
  id: string;
  title: string;
  subtitle?: string;
  authors: string[];
  abstract: string;
  keywords: string[];

  // Categorización
  category: PaperCategory;
  subcategories: string[];
  tags: string[];
  language: PaperLanguage;

  // Control de acceso
  accessLevel: AccessLevel;
  isPremium: boolean;
  isPublished: boolean;

  // Archivo
  fileUrl: string;                // URL en Firebase Storage
  fileName: string;
  fileSize: number;               // Bytes
  mimeType: string;
  thumbnailUrl?: string;

  // Metadata académica
  publicationDate: Date;
  doi?: string;
  isbn?: string;
  journal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  publisher?: string;
  externalUrl?: string;

  // Relaciones
  researchLineId?: string;
  projectId?: string;
  relatedPapers?: string[];

  // Estadísticas
  downloadCount: number;
  viewCount: number;
  citationCount?: number;

  // Metadata
  uploadedBy: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

/**
 * Log de acceso a documentos
 */
export interface AccessLog {
  id: string;
  userId: string;
  userEmail: string;
  paperId: string;
  paperTitle: string;

  // Tipo de acceso
  action: 'view' | 'download' | 'preview';

  // Información del usuario
  subscriptionType?: string;
  hasAccess: boolean;
  accessDeniedReason?: string;

  // Metadata
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

/**
 * Colección temática de papers
 */
export interface PaperCollection {
  id: string;
  title: string;
  description: string;
  coverImageUrl?: string;

  // Documentos
  paperIds: string[];
  paperCount: number;

  // Control de acceso
  accessLevel: AccessLevel;
  isPublic: boolean;

  // Curación
  curatedBy: string;
  curatorName: string;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Request para subir paper
 */
export interface UploadPaperRequest {
  title: string;
  subtitle?: string;
  authors: string[];
  abstract: string;
  keywords: string[];
  category: PaperCategory;
  language: PaperLanguage;
  accessLevel: AccessLevel;
  file: File;
}

/**
 * Response de subir paper
 */
export interface UploadPaperResponse {
  paperId: string;
  fileUrl: string;
  thumbnailUrl?: string;
}

/**
 * Filtros de búsqueda en biblioteca
 */
export interface LibraryFilters {
  category?: PaperCategory;
  language?: PaperLanguage;
  accessLevel?: AccessLevel[];
  authors?: string[];
  keywords?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchTerm?: string;
  isPremium?: boolean;
  isPublished?: boolean;
}

/**
 * Estadísticas de biblioteca
 */
export interface LibraryStatistics {
  totalPapers: number;
  publicPapers: number;
  premiumPapers: number;
  totalDownloads: number;
  totalViews: number;
  papersByCategory: Record<PaperCategory, number>;
  papersByLanguage: Record<PaperLanguage, number>;
  mostDownloaded: Array<{
    paperId: string;
    title: string;
    downloads: number;
  }>;
  recentlyAdded: string[];
}

/**
 * Verificación de acceso
 */
export interface AccessCheck {
  hasAccess: boolean;
  reason?: 'subscription_required' | 'login_required' | 'permission_denied' | 'paper_not_found';
  requiredLevel?: AccessLevel;
  userLevel?: AccessLevel;
}
