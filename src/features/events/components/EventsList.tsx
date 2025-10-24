/**
 * Componente para listar y gestionar eventos en el admin
 */
import { useState, useEffect } from 'react';
import { EventService } from '../services/eventService';
import type { AcademicEvent } from '@/features/research/types';

interface EventsListProps {
  onEdit: (event: AcademicEvent) => void;
  onDelete: (eventId: string) => void;
  refreshTrigger?: number;
}

export default function EventsList({ onEdit, onDelete, refreshTrigger }: EventsListProps) {
  const [events, setEvents] = useState<AcademicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'draft' | 'published' | 'completed'>('all');

  useEffect(() => {
    loadEvents();
  }, [refreshTrigger]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      // Cargar todos los eventos (incluyendo borradores y cancelados)
      const allEvents = await EventService.getAllEvents();
      setEvents(allEvents);
    } catch (err) {
      console.error('Error al cargar eventos:', err);
      setError('Error al cargar los eventos');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFeatured = async (event: AcademicEvent) => {
    try {
      await EventService.toggleFeatured(event.id, !event.featured);
      await loadEvents();
    } catch (err) {
      console.error('Error al actualizar evento destacado:', err);
      alert('Error al actualizar el evento');
    }
  };

  const handleStatusChange = async (eventId: string, newStatus: AcademicEvent['status']) => {
    try {
      await EventService.updateEventStatus(eventId, newStatus);
      await loadEvents();
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      alert('Error al cambiar el estado del evento');
    }
  };

  const getStatusBadge = (status: AcademicEvent['status']) => {
    const badges = {
      draft: 'bg-gray-500 text-white',
      published: 'bg-green-500 text-white',
      registration_closed: 'bg-yellow-500 text-white',
      in_progress: 'bg-blue-500 text-white',
      completed: 'bg-purple-500 text-white',
      cancelled: 'bg-red-500 text-white',
    };
    return badges[status] || 'bg-gray-500 text-white';
  };

  const getStatusLabel = (status: AcademicEvent['status']) => {
    const labels = {
      draft: 'Borrador',
      published: 'Publicado',
      registration_closed: 'Inscripciones cerradas',
      in_progress: 'En progreso',
      completed: 'Completado',
      cancelled: 'Cancelado',
    };
    return labels[status] || status;
  };

  const getEventTypeLabel = (type: AcademicEvent['type']) => {
    const labels = {
      workshop: 'Taller',
      seminar: 'Seminario',
      conference: 'Conferencia',
      lecture: 'Charla',
      course: 'Curso',
      ceremony: 'Ceremonia',
      retreat: 'Retiro',
    };
    return labels[type] || type;
  };

  const filteredEvents = events.filter((event) => {
    if (filter === 'all') return true;
    return event.status === filter;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
        <p className="text-red-700">{error}</p>
        <button
          onClick={loadEvents}
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Todos ({events.length})
        </button>
        <button
          onClick={() => setFilter('published')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'published'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Publicados ({events.filter((e) => e.status === 'published').length})
        </button>
        <button
          onClick={() => setFilter('draft')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'draft'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Borradores ({events.filter((e) => e.status === 'draft').length})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'completed'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Completados ({events.filter((e) => e.status === 'completed').length})
        </button>
      </div>

      {/* Lista de eventos */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No hay eventos para mostrar</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{event.title}</h3>
                    {event.featured && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        ⭐ Destacado
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                        event.status
                      )}`}
                    >
                      {getStatusLabel(event.status)}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-3">{event.shortDescription || event.description}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Tipo:</span>
                      <p className="font-medium text-gray-900">{getEventTypeLabel(event.type)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Fecha:</span>
                      <p className="font-medium text-gray-900">
                        {new Date(event.date).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Modalidad:</span>
                      <p className="font-medium text-gray-900">
                        {event.isOnline ? 'En línea' : 'Presencial'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Participantes:</span>
                      <p className="font-medium text-gray-900">
                        {event.currentParticipants}
                        {event.maxParticipants ? ` / ${event.maxParticipants}` : ' inscritos'}
                      </p>
                    </div>
                  </div>

                  {!event.isFree && event.price && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        ${event.price} {event.currency || 'ARS'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Acciones */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => onEdit(event)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => handleToggleFeatured(event)}
                    className={`px-4 py-2 rounded-lg hover:opacity-80 transition-opacity text-sm font-medium ${
                      event.featured
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {event.featured ? 'Quitar destacado' : 'Destacar'}
                  </button>

                  <select
                    value={event.status}
                    onChange={(e) =>
                      handleStatusChange(event.id, e.target.value as AcademicEvent['status'])
                    }
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <option value="draft">Borrador</option>
                    <option value="published">Publicado</option>
                    <option value="registration_closed">Inscripciones cerradas</option>
                    <option value="in_progress">En progreso</option>
                    <option value="completed">Completado</option>
                    <option value="cancelled">Cancelado</option>
                  </select>

                  <button
                    onClick={() => {
                      if (
                        confirm(
                          `¿Estás seguro de que quieres eliminar el evento "${event.title}"?`
                        )
                      ) {
                        onDelete(event.id);
                      }
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
