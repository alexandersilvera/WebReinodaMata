/**
 * Exports del feature de eventos académicos
 */

// Services
export { EventService } from './services/eventService';
export { EventRegistrationService } from './services/eventRegistrationService';

// Types
export type {
  EventRegistration,
  Certificate,
  EventStatistics,
  CertificateVerification,
  CertificateTemplate,
  GenerateCertificateRequest,
  GenerateCertificateResponse,
} from './types';

// Components - Public
export { default as EventCard } from './components/EventCard';
export { default as EventFilters } from './components/EventFilters';
export { default as UpcomingEventsWidget } from './components/UpcomingEventsWidget';

// Components - Admin
export { default as EventsManager } from './components/EventsManager';
export { default as EventsList } from './components/EventsList';
export { default as EventForm } from './components/EventForm';
