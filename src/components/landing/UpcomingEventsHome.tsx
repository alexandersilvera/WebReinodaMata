/**
 * Componente de Próximos Eventos para Landing Page
 * Muestra los próximos 3 eventos en cards destacadas
 */
import { useEffect, useState } from 'react';
import type { AcademicEvent } from '@/features/research/types';
import { formatDate } from '@/core/utils/dateUtils';

export default function UpcomingEventsHome() {
  const [events, setEvents] = useState<AcademicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true);

        console.log('[UpcomingEventsHome] Iniciando carga de eventos...');
        console.log('[UpcomingEventsHome] window.eventServices:', window.eventServices);

        if (!window.eventServices) {
          console.error('[UpcomingEventsHome] eventServices no está disponible en window');
          setError('Servicios no disponibles');
          return;
        }

        const upcomingEvents = await window.eventServices.getUpcomingEvents(3);
        console.log('[UpcomingEventsHome] Eventos cargados:', upcomingEvents);

        setEvents(upcomingEvents || []);
      } catch (err) {
        console.error('[UpcomingEventsHome] Error cargando eventos:', err);
        setError('No se pudieron cargar los eventos');
      } finally {
        setLoading(false);
      }
    }

    // Esperar un poco para asegurar que globalServices se haya cargado
    const timer = setTimeout(() => {
      loadEvents();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Próximos Eventos
            </h2>
            <div className="w-24 h-1 bg-green-600 mx-auto mb-6"></div>
          </div>

          {/* Loading Skeleton */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-800 rounded-lg overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-700"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-700 rounded mb-4"></div>
                  <div className="h-6 bg-gray-700 rounded mb-4"></div>
                  <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || events.length === 0) {
    return (
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Próximos Eventos
            </h2>
            <div className="w-24 h-1 bg-green-600 mx-auto mb-6"></div>
            <p className="text-xl text-gray-400">
              {error || 'No hay eventos programados por el momento'}
            </p>
            <a
              href="/eventos"
              className="inline-block mt-8 px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg transition-all"
            >
              Ver Todos los Eventos
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Título de la sección */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Próximos Eventos
          </h2>
          <div className="w-24 h-1 bg-green-600 mx-auto mb-6"></div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Únete a nuestras actividades espirituales, talleres y ceremonias
          </p>
        </div>

        {/* Grid de eventos */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>

        {/* CTA para ver todos los eventos */}
        <div className="text-center">
          <a
            href="/eventos"
            className="inline-block px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg"
          >
            Ver Todos los Eventos →
          </a>
        </div>
      </div>
    </section>
  );
}

/**
 * Card individual de evento
 */
function EventCard({ event }: { event: AcademicEvent }) {
  const eventDate = event.date instanceof Date
    ? event.date
    : event.date?.toDate?.() || new Date();

  const formattedDate = formatDate(eventDate);

  // Determinar si requiere pago
  const isPaid = !event.isFree && (event.price ?? 0) > 0;

  return (
    <a
      href={`/eventos/${event.id}`}
      className="group bg-gray-800 rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 border border-gray-700 hover:border-green-600"
    >
      {/* Imagen del evento */}
      {event.imageUrl ? (
        <div className="relative h-48 overflow-hidden">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

          {/* Badge de precio si es pago */}
          {isPaid && (
            <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
              ${event.price}
            </div>
          )}
        </div>
      ) : (
        <div className="h-48 bg-gradient-to-br from-green-900 to-gray-800 flex items-center justify-center">
          <div className="text-6xl">🕯️</div>
        </div>
      )}

      {/* Contenido */}
      <div className="p-6">
        {/* Fecha */}
        <div className="flex items-center text-green-400 text-sm mb-3">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {formattedDate}
        </div>

        {/* Título */}
        <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-green-400 transition-colors line-clamp-2">
          {event.title}
        </h3>

        {/* Descripción */}
        {event.description && (
          <p className="text-gray-400 text-sm mb-4 line-clamp-2">
            {event.description}
          </p>
        )}

        {/* Tipo y capacidad */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 capitalize">
            {event.type || 'Evento'}
          </span>

          {event.maxParticipants && (
            <div className="flex items-center text-gray-500">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {event.currentParticipants || 0}/{event.maxParticipants}
            </div>
          )}
        </div>

        {/* Indicador de "Ver más" */}
        <div className="mt-4 text-green-400 text-sm font-semibold flex items-center group-hover:translate-x-2 transition-transform">
          Ver detalles
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </a>
  );
}
