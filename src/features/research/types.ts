// Research-related types for the Instituto

export interface ResearchLine {
  id: string;
  name: string;
  description: string;
  category: 'human-rights' | 'anthropology' | 'history' | 'sociology';
  activeProjects: number;
  coordinator: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResearchProject {
  id: string;
  title: string;
  description: string;
  abstractText: string;
  researchLineId: string;
  status: 'planning' | 'active' | 'completed' | 'paused';
  startDate: Date;
  endDate?: Date;
  researchers: string[];
  collaborators: string[];
  tags: string[];
  methodology: string;
  expectedResults: string;
  budget?: number;
  publications: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ResearchPaper {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  content?: string;
  keywords: string[];
  category: 'racism' | 'human-rights' | 'anthropology' | 'history' | 'sociology';
  publicationDate: Date;
  pdfUrl?: string;
  externalUrl?: string;
  citations: number;
  doi?: string;
  journal?: string;
  projectId?: string;
  isPublished: boolean;
  language: 'es' | 'en' | 'pt';
  createdAt: Date;
  updatedAt: Date;
}

export interface Researcher {
  id: string;
  name: string;
  email: string;
  bio: string;
  profileImageUrl?: string;
  specialization: string[];
  researchLines: string[];
  affiliation: string;
  academicDegree: string;
  contactInfo: {
    email: string;
    phone?: string;
    website?: string;
    orcid?: string;
    academicProfiles?: string[];
  };
  activeProjects: string[];
  publications: string[];
  isActive: boolean;
  joinDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AcademicEvent {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  type: 'workshop' | 'seminar' | 'conference' | 'lecture' | 'course' | 'ceremony' | 'retreat';
  date: Date;
  endDate?: Date;
  duration: number; // in hours
  location: string;
  isOnline: boolean;
  meetingLink?: string;
  maxParticipants?: number;
  currentParticipants: number;
  registrationRequired: boolean;
  registrationDeadline?: Date;
  speakers: string[];
  topics: string[];
  materials: string[];
  imageUrl?: string;

  // Precio y pago
  isFree: boolean;
  price?: number;
  currency?: string;
  requiresSubscription?: boolean;
  allowedSubscriptionTiers?: string[];

  // Estado
  status: 'draft' | 'published' | 'registration_closed' | 'in_progress' | 'completed' | 'cancelled';
  featured?: boolean;

  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface HumanRightsCase {
  id: string;
  title: string;
  description: string;
  caseType: 'workplace' | 'education' | 'healthcare' | 'housing' | 'public-spaces' | 'media' | 'other';
  discriminationType: 'religious' | 'racial' | 'ethnic' | 'cultural' | 'combined';
  reportDate: Date;
  incidentDate: Date;
  location: string;
  status: 'reported' | 'investigating' | 'resolved' | 'legal-action' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  affectedPeople: number;
  evidence: string[];
  followUpActions: string[];
  legalActions: string[];
  resolution?: string;
  isAnonymous: boolean;
  contactInfo?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface HumanRightsReport {
  id: string;
  title: string;
  year: number;
  quarter?: number;
  summary: string;
  methodology: string;
  findings: string[];
  recommendations: string[];
  cases: string[]; // Array of case IDs
  statistics: {
    totalCases: number;
    byType: Record<string, number>;
    byLocation: Record<string, number>;
    resolvedCases: number;
    pendingCases: number;
  };
  pdfUrl?: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EducationalResource {
  id: string;
  title: string;
  description: string;
  type: 'guide' | 'infographic' | 'video' | 'document' | 'toolkit' | 'legal-info';
  category: 'anti-racism' | 'human-rights' | 'legal-rights' | 'cultural-education' | 'activism';
  content?: string;
  fileUrl?: string;
  downloadUrl?: string;
  externalUrl?: string;
  language: 'es' | 'en' | 'pt';
  targetAudience: string[];
  tags: string[];
  downloadCount: number;
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Service interfaces
export interface ResearchFilters {
  category?: string;
  status?: string;
  researchLine?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  keywords?: string[];
}

export interface HumanRightsFilters {
  caseType?: string;
  status?: string;
  discriminationType?: string;
  priority?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  location?: string;
}

export interface ResourceFilters {
  type?: string;
  category?: string;
  language?: string;
  targetAudience?: string;
}