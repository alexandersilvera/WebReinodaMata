/**
 * Componente de detalle de evento académico
 */
import { useEffect, useState } from 'react';
import { EventService } from '../services/eventService';
import { formatDate, formatDateTime, formatTime, getRelativeTime } from '@/core/utils/dateUtils';
import type { AcademicEvent } from '@/features/research/types';
import { useAuth } from '@/core/hooks/useAuth';

interface EventDetailClientProps {
  eventId: string;
}

const eventTypeLabels: Record<AcademicEvent['type'], string> = {
  workshop: 'Taller',
  seminar: 'Seminario',
  conference: 'Conferencia',
  lecture: 'Conferencia',
  course: 'Curso',
  ceremony: 'Ceremonia',
  retreat: 'Retiro',
};

export default function EventDetailClient({ eventId }: EventDetailClientProps) {
  const [event, setEvent] = useState<AcademicEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  const loadEvent = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await EventService.getEventById(eventId);

      if (!data) {
        setError('Evento no encontrado');
        return;
      }

      setEvent(data);
    } catch (err) {
      console.error('Error loading event:', err);
      setError('No se pudo cargar el evento. Por favor, intenta más tarde.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600 text-lg">Cargando evento...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20">
        <div className="bg-red-50 border-l-4 border-red-600 rounded-r-lg p-6">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-red-600 mr-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="text-lg font-bold text-red-900 mb-1">
                {error || 'Evento no encontrado'}
              </h3>
              <a
                href="/eventos"
                className="mt-3 inline-block text-sm text-red-600 hover:text-red-700 font-medium underline"
              >
                Volver a eventos
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const eventDate = event.date instanceof Date ? event.date : new Date(event.date);
  const isPastEvent = eventDate < new Date();
  const isRegistrationOpen = EventService.isRegistrationOpen(event);
  const isFull = event.maxParticipants && event.currentParticipants >= event.maxParticipants;
  const spotsLeft = event.maxParticipants ? event.maxParticipants - event.currentParticipants : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Image */}
      {event.imageUrl && (
        <div className="relative h-96 overflow-hidden">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

          {/* Breadcrumb over image */}
          <div className="absolute top-6 left-0 right-0">
            <div className="max-w-6xl mx-auto px-4">
              <nav className="flex text-sm text-white/90">
                <a href="/" className="hover:text-white">Inicio</a>
                <span className="mx-2">/</span>
                <a href="/eventos" className="hover:text-white">Eventos</a>
                <span className="mx-2">/</span>
                <span className="text-white font-medium">{event.title}</span>
              </nav>
            </div>
          </div>

          {/* Title over image */}
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="max-w-6xl mx-auto">
              <span className="inline-block px-3 py-1 bg-blue-600 text-white text-sm font-semibold rounded-full mb-3">
                {eventTypeLabels[event.type]}
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                {event.title}
              </h1>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Info Cards */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-lg p-4 shadow-md">
                <div className="flex items-center text-gray-600 mb-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-sm font-medium">Fecha</span>
                </div>
                <p className="text-lg font-bold text-gray-900">{formatDate(eventDate)}</p>
                <p className="text-sm text-gray-600">{getRelativeTime(eventDate)}</p>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-md">
                <div className="flex items-center text-gray-600 mb-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-sm font-medium">Duración</span>
                </div>
                <p className="text-lg font-bold text-gray-900">{event.duration} horas</p>
                {event.endDate && (
                  <p className="text-sm text-gray-600">
                    Hasta {formatDate(new Date(event.endDate))}
                  </p>
                )}
              </div>

              <div className="bg-white rounded-lg p-4 shadow-md">
                <div className="flex items-center text-gray-600 mb-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <span className="text-sm font-medium">Participantes</span>
                </div>
                <p className="text-lg font-bold text-gray-900">
                  {event.currentParticipants}
                  {event.maxParticipants && ` / ${event.maxParticipants}`}
                </p>
                {spotsLeft !== null && spotsLeft > 0 && (
                  <p className="text-sm text-green-600">{spotsLeft} cupos disponibles</p>
                )}
                {isFull && <p className="text-sm text-red-600">Cupos agotados</p>}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Descripción</h2>
              <div className="prose prose-blue max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {event.description}
                </p>
              </div>
            </div>

            {/* Topics */}
            {event.topics && event.topics.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Temas a tratar</h2>
                <ul className="space-y-2">
                  {event.topics.map((topic, index) => (
                    <li key={index} className="flex items-start">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-blue-600 mr-2 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-gray-700">{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Speakers */}
            {event.speakers && event.speakers.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Facilitadores</h2>
                <div className="space-y-3">
                  {event.speakers.map((speaker, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold mr-3">
                        {speaker.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-gray-900 font-medium">{speaker}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Ubicación</h2>
              <div className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-600 mr-3 flex-shrink-0 mt-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <div>
                  {event.isOnline ? (
                    <>
                      <p className="text-gray-900 font-medium mb-1">Evento Online</p>
                      <p className="text-gray-600 text-sm">
                        Recibirás el enlace de acceso al confirmar tu registro
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-gray-900 font-medium mb-1">{event.location}</p>
                      <p className="text-gray-600 text-sm">Evento presencial</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Registration Card */}
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
              <div className="text-center mb-6">
                {event.isFree ? (
                  <div>
                    <p className="text-3xl font-bold text-green-600 mb-2">Gratis</p>
                    <p className="text-sm text-gray-600">Evento gratuito</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-3xl font-bold text-blue-600 mb-2">
                      {event.currency === 'USD' ? '$' : event.currency} {event.price?.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">Por persona</p>
                  </div>
                )}
              </div>

              {/* Registration Button */}
              {isPastEvent ? (
                <div className="bg-gray-100 text-gray-600 text-center py-3 px-4 rounded-lg font-medium">
                  Evento finalizado
                </div>
              ) : !isRegistrationOpen ? (
                <div className="bg-orange-100 text-orange-700 text-center py-3 px-4 rounded-lg font-medium">
                  Inscripciones cerradas
                </div>
              ) : isFull ? (
                <div className="bg-red-100 text-red-700 text-center py-3 px-4 rounded-lg font-medium">
                  Cupos agotados
                </div>
              ) : (
                <a
                  href={user ? `/eventos/${event.id}/registro` : `/login?redirect=/eventos/${event.id}/registro`}
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3 px-4 rounded-lg font-bold transition-colors"
                >
                  {user ? 'Inscribirme ahora' : 'Iniciar sesión para inscribirme'}
                </a>
              )}

              {/* Requirements */}
              {event.requiresSubscription && (
                <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-xs text-purple-800 font-medium flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Requiere suscripción activa
                  </p>
                </div>
              )}

              {/* Deadline */}
              {event.registrationDeadline && isRegistrationOpen && (
                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-600">
                    Inscripciones hasta: <br />
                    <span className="font-medium text-gray-900">
                      {formatDateTime(new Date(event.registrationDeadline))}
                    </span>
                  </p>
                </div>
              )}

              {/* Share */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-3 text-center">
                  Compartir evento
                </p>
                <div className="flex justify-center gap-2">
                  <button className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                    </svg>
                  </button>
                  <button className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                    </svg>
                  </button>
                  <button className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
