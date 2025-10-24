/**
 * Widget para mostrar próximos eventos en la página del instituto
 */
import { useEffect, useState } from 'react';
import { EventService } from '../services/eventService';
import { formatDate } from '@/core/utils/dateUtils';
import type { AcademicEvent } from '@/features/research/types';

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
  workshop: 'bg-blue-700',
  seminar: 'bg-green-700',
  conference: 'bg-purple-700',
  lecture: 'bg-orange-700',
  course: 'bg-indigo-700',
  ceremony: 'bg-pink-700',
  retreat: 'bg-teal-700',
};

interface UpcomingEventsWidgetProps {
  limit?: number;
}

export default function UpcomingEventsWidget({ limit = 4 }: UpcomingEventsWidgetProps) {
  const [events, setEvents] = useState<AcademicEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await EventService.getUpcomingEvents(limit);
      console.log('Eventos cargados:', data);
      setEvents(data);
    } catch (err) {
      console.error('Error loading upcoming events:', err);
      // Si hay error de índice, mostrar mensaje específico
      if (err instanceof Error && err.message.includes('index')) {
        console.error('⚠️ Los índices de Firestore aún se están construyendo. Esto puede tardar unos minutos.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {[...Array(limit)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex bg-white rounded-lg shadow-md overflow-hidden">
              <div className="w-1/4 bg-gray-300"></div>
              <div className="w-3/4 p-4">
                <div className="h-4 bg-gray-300 rounded mb-2 w-3/4"></div>
                <div className="h-3 bg-gray-300 rounded mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 text-gray-400 mx-auto mb-3"
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
        <p className="text-gray-600">No hay eventos próximos programados</p>
        <p className="text-sm text-gray-500 mt-2">Vuelve pronto para ver nuevos eventos</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {events.map((event) => {
        const eventDate = event.date instanceof Date ? event.date : new Date(event.date);
        const day = eventDate.getDate();
        const month = eventDate.toLocaleDateString('es-UY', { month: 'short' });

        return (
          <a
            key={event.id}
            href={`/eventos/${event.id}`}
            className="flex bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div
              className={`w-1/4 ${eventTypeColors[event.type]} flex items-center justify-center text-white p-4`}
            >
              <div className="text-center">
                <span className="block text-2xl font-bold">{day}</span>
                <span className="block text-sm capitalize">{month}</span>
              </div>
            </div>
            <div className="w-3/4 p-4">
              <h3 className="text-lg font-bold text-gray-900 mb-1 hover:text-blue-600 transition-colors line-clamp-2">
                {event.title}
              </h3>
              <p className="text-gray-600 text-sm mb-2 line-clamp-1">
                {eventTypeLabels[event.type]}
              </p>
              <p className="text-gray-700 text-sm line-clamp-2">
                {event.shortDescription || event.description}
              </p>
              {event.isFree ? (
                <span className="inline-block mt-2 text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded">
                  Gratuito
                </span>
              ) : (
                <span className="inline-block mt-2 text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded">
                  {event.currency === 'USD' ? '$' : event.currency} {event.price?.toFixed(2)}
                </span>
              )}
            </div>
          </a>
        );
      })}
    </div>
  );
}
