/**
 * Componente principal para gestionar eventos en el admin
 * Coordina la lista de eventos y el formulario de creación/edición
 */
import { useState } from 'react';
import EventsList from './EventsList';
import EventForm from './EventForm';
import { EventService } from '../services/eventService';
import type { AcademicEvent } from '@/features/research/types';

export default function EventsManager() {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [selectedEvent, setSelectedEvent] = useState<AcademicEvent | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleCreateNew = () => {
    setSelectedEvent(null);
    setView('form');
  };

  const handleEdit = (event: AcademicEvent) => {
    setSelectedEvent(event);
    setView('form');
  };

  const handleDelete = async (eventId: string) => {
    try {
      await EventService.deleteEvent(eventId);
      showMessage('success', 'Evento eliminado correctamente');
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      console.error('Error al eliminar evento:', err);
      showMessage('error', 'Error al eliminar el evento');
    }
  };

  const handleFormSuccess = () => {
    const action = selectedEvent ? 'actualizado' : 'creado';
    showMessage('success', `Evento ${action} correctamente`);
    setView('list');
    setSelectedEvent(null);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleFormCancel = () => {
    setView('list');
    setSelectedEvent(null);
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Mensajes de estado */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center">
            {message.type === 'success' ? (
              <svg
                className="h-5 w-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="h-5 w-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <span className="font-medium">{message.text}</span>
          </div>
        </div>
      )}

      {/* Vista de lista */}
      {view === 'list' && (
        <>
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Todos los Eventos</h2>
              <p className="text-sm text-gray-600">
                Gestiona, edita y publica eventos académicos
              </p>
            </div>
            <button
              onClick={handleCreateNew}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Crear Nuevo Evento
            </button>
          </div>

          <EventsList
            onEdit={handleEdit}
            onDelete={handleDelete}
            refreshTrigger={refreshTrigger}
          />
        </>
      )}

      {/* Vista de formulario */}
      {view === 'form' && (
        <div>
          <button
            onClick={handleFormCancel}
            className="mb-4 text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Volver a la lista
          </button>

          <EventForm
            event={selectedEvent}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </div>
      )}
    </div>
  );
}
