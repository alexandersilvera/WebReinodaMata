/**
 * Componente de tarjeta para mostrar eventos académicos
 */
import { formatDate } from '@/core/utils/dateUtils';
import type { AcademicEvent } from '@/features/research/types';

interface EventCardProps {
  event: AcademicEvent;
  className?: string;
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

const eventTypeColors: Record<AcademicEvent['type'], string> = {
  workshop: 'bg-blue-100 text-blue-800',
  seminar: 'bg-green-100 text-green-800',
  conference: 'bg-purple-100 text-purple-800',
  lecture: 'bg-orange-100 text-orange-800',
  course: 'bg-indigo-100 text-indigo-800',
  ceremony: 'bg-pink-100 text-pink-800',
  retreat: 'bg-teal-100 text-teal-800',
};

const eventTypeBorderColors: Record<AcademicEvent['type'], string> = {
  workshop: 'border-l-blue-600',
  seminar: 'border-l-green-600',
  conference: 'border-l-purple-600',
  lecture: 'border-l-orange-600',
  course: 'border-l-indigo-600',
  ceremony: 'border-l-pink-600',
  retreat: 'border-l-teal-600',
};

export default function EventCard({ event, className = '' }: EventCardProps) {
  const isFull = event.maxParticipants && event.currentParticipants >= event.maxParticipants;
  const spotsLeft = event.maxParticipants ? event.maxParticipants - event.currentParticipants : null;
  const eventDate = event.date instanceof Date ? event.date : new Date(event.date);
  const isPastEvent = eventDate < new Date();

  return (
    <a
      href={`/eventos/${event.id}`}
      className={`block bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-l-4 ${eventTypeBorderColors[event.type]} ${className}`}
    >
      {/* Image */}
      {event.imageUrl && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
          {event.featured && (
            <div className="absolute top-3 right-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Destacado
            </div>
          )}
        </div>
      )}

      <div className="p-5">
        {/* Type and Date */}
        <div className="flex items-center justify-between mb-3">
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full ${eventTypeColors[event.type]}`}
          >
            {eventTypeLabels[event.type]}
          </span>
          <div className="flex items-center text-sm text-gray-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
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
            {formatDate(eventDate)}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
          {event.title}
        </h3>

        {/* Description */}
        <p className="text-gray-700 text-sm mb-4 line-clamp-2">
          {event.shortDescription || event.description}
        </p>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          {/* Duration */}
          <div className="flex items-center text-gray-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
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
            {event.duration}h
          </div>

          {/* Location */}
          <div className="flex items-center text-gray-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
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
            {event.isOnline ? 'Online' : event.location}
          </div>
        </div>

        {/* Price and Spots */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <div className="text-lg font-bold">
            {event.isFree ? (
              <span className="text-green-600">Gratis</span>
            ) : (
              <span className="text-blue-600">
                {event.currency === 'USD' ? '$' : event.currency}{' '}
                {event.price?.toFixed(2)}
              </span>
            )}
          </div>

          {/* Registration Status */}
          <div className="text-sm">
            {isPastEvent ? (
              <span className="text-gray-500 font-medium">Finalizado</span>
            ) : isFull ? (
              <span className="text-red-600 font-medium">Cupos agotados</span>
            ) : spotsLeft !== null && spotsLeft <= 5 ? (
              <span className="text-orange-600 font-medium">
                {spotsLeft} cupos disponibles
              </span>
            ) : (
              <span className="text-blue-600 font-medium flex items-center">
                Ver detalles
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 ml-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </span>
            )}
          </div>
        </div>

        {/* Requires Subscription Badge */}
        {event.requiresSubscription && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <span className="inline-flex items-center text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              Requiere suscripción
            </span>
          </div>
        )}
      </div>
    </a>
  );
}
