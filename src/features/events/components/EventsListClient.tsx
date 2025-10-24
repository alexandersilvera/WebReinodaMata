/**
 * Componente cliente para listar eventos con filtros
 */
import { useEffect, useState } from 'react';
import { EventService } from '../services/eventService';
import EventCard from './EventCard';
import EventFilters, { type EventFilterState } from './EventFilters';
import type { AcademicEvent } from '@/features/research/types';

export default function EventsListClient() {
  const [events, setEvents] = useState<AcademicEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<AcademicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<EventFilterState>({});

  // Cargar eventos inicialmente
  useEffect(() => {
    loadEvents();
  }, []);

  // Aplicar filtros cuando cambian
  useEffect(() => {
    applyFilters();
  }, [events, filters]);

  // Actualizar estadísticas
  useEffect(() => {
    updateStats();
  }, [filteredEvents]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await EventService.getPublishedEvents();
      setEvents(data);
    } catch (err) {
      console.error('Error loading events:', err);
      setError('No se pudieron cargar los eventos. Por favor, intenta más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...events];

    // Filtro por tipo
    if (filters.type) {
      filtered = filtered.filter((event) => event.type === filters.type);
    }

    // Filtro por precio
    if (filters.isFree !== undefined) {
      filtered = filtered.filter((event) => event.isFree === filters.isFree);
    }

    // Filtro por modalidad
    if (filters.isOnline !== undefined) {
      filtered = filtered.filter((event) => event.isOnline === filters.isOnline);
    }

    // Filtro por fecha
    if (filters.dateRange) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      switch (filters.dateRange) {
        case 'upcoming':
          filtered = filtered.filter(
            (event) => new Date(event.date) >= today
          );
          break;
        case 'thisMonth':
          const endOfMonth = new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            0
          );
          filtered = filtered.filter((event) => {
            const eventDate = new Date(event.date);
            return eventDate >= today && eventDate <= endOfMonth;
          });
          break;
        case 'thisYear':
          const endOfYear = new Date(now.getFullYear(), 11, 31);
          filtered = filtered.filter((event) => {
            const eventDate = new Date(event.date);
            return eventDate >= today && eventDate <= endOfYear;
          });
          break;
      }
    }

    setFilteredEvents(filtered);
  };

  const updateStats = () => {
    const now = new Date();

    // Total eventos
    const totalElement = document.getElementById('totalEvents');
    if (totalElement) totalElement.textContent = filteredEvents.length.toString();

    // Próximos eventos
    const upcoming = filteredEvents.filter(
      (e) => new Date(e.date) >= now
    ).length;
    const upcomingElement = document.getElementById('upcomingEvents');
    if (upcomingElement) upcomingElement.textContent = upcoming.toString();

    // Eventos gratuitos
    const free = filteredEvents.filter((e) => e.isFree).length;
    const freeElement = document.getElementById('freeEvents');
    if (freeElement) freeElement.textContent = free.toString();

    // Eventos online
    const online = filteredEvents.filter((e) => e.isOnline).length;
    const onlineElement = document.getElementById('onlineEvents');
    if (onlineElement) onlineElement.textContent = online.toString();
  };

  const handleFilterChange = (newFilters: EventFilterState) => {
    setFilters(newFilters);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600 text-lg">Cargando eventos...</p>
      </div>
    );
  }

  if (error) {
    return (
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
              Error al cargar eventos
            </h3>
            <p className="text-red-700">{error}</p>
            <button
              onClick={loadEvents}
              className="mt-3 text-sm text-red-600 hover:text-red-700 font-medium underline"
            >
              Intentar nuevamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Filtros */}
      <EventFilters onFilterChange={handleFilterChange} initialFilters={filters} />

      {/* Lista de eventos */}
      {filteredEvents.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-20 w-20 text-gray-400 mx-auto mb-4"
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
          <h3 className="text-xl font-bold text-gray-700 mb-2">
            No se encontraron eventos
          </h3>
          <p className="text-gray-600 mb-4">
            {Object.keys(filters).length > 0
              ? 'Intenta ajustar los filtros para ver más resultados'
              : 'No hay eventos disponibles en este momento'}
          </p>
          {Object.keys(filters).length > 0 && (
            <button
              onClick={() => handleFilterChange({})}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Resultados count */}
          <div className="mb-6 text-gray-700">
            Mostrando <span className="font-bold">{filteredEvents.length}</span>{' '}
            {filteredEvents.length === 1 ? 'evento' : 'eventos'}
            {Object.keys(filters).length > 0 && ' (filtrados)'}
          </div>

          {/* Grid de eventos */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
