/**
 * Componente de Próximos Eventos para Landing Page
 * Muestra los próximos 3 eventos en cards destacadas
 *
 * Actualización Enero 2026:
 * - Animaciones Framer Motion (staggered, fade-in)
 * - Intersection Observer para lazy animations
 * - Hover effects mejorados
 */
import { useEffect, useState, useRef } from 'react';
import { motion, useInView, type Variants } from 'framer-motion';
import type { AcademicEvent } from '@/features/research/types';
import { formatDate } from '@/core/utils/dateUtils';
import { SkeletonEventCard } from '@/components/Loading';

// Variantes de animación para el contenedor
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1
    }
  }
};

// Variantes de animación para items individuales
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.6, 0.05, 0.01, 0.9] as const
    }
  }
};

export default function UpcomingEventsHome() {
  const [events, setEvents] = useState<AcademicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  useEffect(() => {
    let cancelled = false;

    async function waitForServices(): Promise<boolean> {
      // Esperar hasta que los servicios estén disponibles (máx 5 segundos)
      const maxAttempts = 50; // 50 intentos x 100ms = 5 segundos
      for (let i = 0; i < maxAttempts; i++) {
        if (cancelled) return false;
        if (window.eventServices) {
          console.log('[UpcomingEventsHome] Servicios disponibles después de', i * 100, 'ms');
          return true;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      console.error('[UpcomingEventsHome] Timeout esperando servicios');
      return false;
    }

    async function loadEvents() {
      try {
        setLoading(true);

        console.log('[UpcomingEventsHome] Esperando servicios...');
        const servicesAvailable = await waitForServices();

        if (!servicesAvailable || cancelled) {
          if (!cancelled) {
            setError('Servicios no disponibles');
          }
          return;
        }

        const upcomingEvents = await window.eventServices.getUpcomingEvents(3);

        if (!cancelled) {
          console.log('[UpcomingEventsHome] Eventos cargados:', upcomingEvents);
          setEvents(upcomingEvents || []);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('[UpcomingEventsHome] Error cargando eventos:', err);
          setError('No se pudieron cargar los eventos');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadEvents();

    return () => {
      cancelled = true;
    };
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

          {/* Loading Skeleton - Usando componente reutilizable */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <SkeletonEventCard key={i} />
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
    <section ref={sectionRef} className="py-20 bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Título de la sección */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Próximos Eventos
          </h2>
          <div className="w-24 h-1 bg-green-600 mx-auto mb-6"></div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Únete a nuestras actividades espirituales, talleres y ceremonias
          </p>
        </motion.div>

        {/* Grid de eventos con animaciones staggered */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {events.map((event, index) => (
            <motion.div key={event.id} variants={itemVariants}>
              <EventCard event={event} />
            </motion.div>
          ))}
        </motion.div>

        {/* CTA para ver todos los eventos */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <motion.a
            href="/eventos"
            className="inline-block px-8 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-lg"
            whileHover={{
              scale: 1.05,
              boxShadow: "0 20px 40px rgba(34, 197, 94, 0.4)",
              backgroundColor: "#16a34a"
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            Ver Todos los Eventos →
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}

/**
 * Card individual de evento con animaciones mejoradas
 */
function EventCard({ event }: { event: AcademicEvent }) {
  const eventDate = event.date instanceof Date
    ? event.date
    : (event.date as any)?.toDate?.() || new Date();

  const formattedDate = formatDate(eventDate);

  // Determinar si requiere pago
  const isPaid = !event.isFree && (event.price ?? 0) > 0;

  return (
    <motion.a
      href={`/eventos/${event.id}`}
      className="block bg-gray-800 rounded-lg overflow-hidden shadow-xl border border-gray-700"
      whileHover={{
        y: -8,
        boxShadow: "0 25px 50px -12px rgba(34, 197, 94, 0.25)",
        borderColor: "#16a34a"
      }}
      transition={{ duration: 0.3 }}
    >
      {/* Imagen del evento */}
      {event.imageUrl ? (
        <div className="relative h-48 overflow-hidden">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
            decoding="async"
            width="600"
            height="400"
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
        <motion.div
          className="mt-4 text-green-400 text-sm font-semibold flex items-center"
          initial={{ x: 0 }}
          whileHover={{ x: 8 }}
          transition={{ duration: 0.2 }}
        >
          Ver detalles
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </motion.div>
      </div>
    </motion.a>
  );
}
