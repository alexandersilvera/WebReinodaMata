/**
 * Panel de eventos del usuario - Mis inscripciones
 */
import { useEffect, useState } from 'react';
import { EventRegistrationService } from '../services/eventRegistrationService';
import { formatDate } from '@/core/utils/dateUtils';
import type { EventRegistration } from '@/features/events/types';
import { useAuth } from '@/core/hooks/useAuth';

const statusLabels: Record<EventRegistration['status'], string> = {
  registered: 'Registrado',
  confirmed: 'Confirmado',
  attended: 'Asistido',
  cancelled: 'Cancelado',
  no_show: 'No asistió',
};

const statusColors: Record<EventRegistration['status'], string> = {
  registered: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  attended: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
  no_show: 'bg-gray-100 text-gray-800',
};

export default function MyEventsClient() {
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      window.location.href = '/login?redirect=/mi-cuenta/mis-eventos';
      return;
    }
    loadRegistrations();

    // Check for success registration
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('registered')) {
      // Show success message
      setTimeout(() => {
        const msg = document.getElementById('successMessage');
        if (msg) msg.classList.remove('hidden');
      }, 500);
    }
  }, [user]);

  const loadRegistrations = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const data = await EventRegistrationService.getUserRegistrations(user.uid);
      setRegistrations(data);
    } catch (err) {
      console.error('Error loading registrations:', err);
      setError('No se pudieron cargar tus inscripciones.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRegistration = async (registrationId: string) => {
    if (!confirm('¿Estás seguro de que deseas cancelar esta inscripción?')) {
      return;
    }

    try {
      await EventRegistrationService.cancelRegistration(
        registrationId,
        'Cancelado por el usuario'
      );
      loadRegistrations();
    } catch (err: any) {
      alert(err.message || 'Error al cancelar la inscripción');
    }
  };

  const filteredRegistrations = registrations.filter((reg) => {
    if (filter === 'all') return true;
    // Aquí podrías agregar lógica de filtrado por fecha si lo necesitas
    return true;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600 text-lg">Cargando inscripciones...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Eventos</h1>
          <p className="text-gray-600">Gestiona tus inscripciones a eventos académicos</p>
        </div>

        {/* Success Message */}
        <div id="successMessage" className="hidden mb-6 bg-green-50 border-l-4 border-green-600 rounded-r-lg p-6">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-green-600 mr-3"
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
            <div>
              <h3 className="text-lg font-bold text-green-900">¡Inscripción exitosa!</h3>
              <p className="text-green-800">Te hemos enviado un correo de confirmación.</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {registrations.length}
            </div>
            <div className="text-sm text-gray-600">Total de eventos</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {registrations.filter((r) => r.status === 'confirmed').length}
            </div>
            <div className="text-sm text-gray-600">Confirmados</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {registrations.filter((r) => r.status === 'attended').length}
            </div>
            <div className="text-sm text-gray-600">Asistidos</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {registrations.filter((r) => r.certificateIssued).length}
            </div>
            <div className="text-sm text-gray-600">Certificados</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'upcoming'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Próximos
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'past'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pasados
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-600 rounded-r-lg p-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Registrations List */}
        {filteredRegistrations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
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
              No tienes inscripciones aún
            </h3>
            <p className="text-gray-600 mb-6">
              Explora nuestros eventos académicos y comienza a inscribirte
            </p>
            <a
              href="/eventos"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ver eventos disponibles
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 ml-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRegistrations.map((registration) => (
              <div
                key={registration.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {registration.eventTitle}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                        <div className="flex items-center">
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
                          Registrado: {formatDate(registration.registrationDate)}
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[registration.status]}`}
                    >
                      {statusLabels[registration.status]}
                    </span>
                  </div>

                  {/* Payment Status */}
                  {registration.paymentRequired && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center text-sm">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2 text-gray-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                          />
                        </svg>
                        <span className="text-gray-700">
                          Pago:{' '}
                          <span
                            className={
                              registration.paymentStatus === 'paid'
                                ? 'text-green-600 font-medium'
                                : 'text-orange-600 font-medium'
                            }
                          >
                            {registration.paymentStatus === 'paid'
                              ? 'Confirmado'
                              : 'Pendiente'}
                          </span>
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Certificate */}
                  {registration.certificateIssued && registration.certificateId && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-blue-800">
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
                              d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                            />
                          </svg>
                          <span className="font-medium">Certificado disponible</span>
                        </div>
                        <a
                          href={`/certificados/${registration.certificateId}`}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium underline"
                        >
                          Ver certificado
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3">
                    <a
                      href={`/eventos/${registration.eventId}`}
                      className="flex-1 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-center font-medium transition-colors"
                    >
                      Ver detalles
                    </a>

                    {registration.status === 'confirmed' &&
                      !registration.certificateIssued && (
                        <button
                          disabled
                          className="flex-1 px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-center font-medium cursor-not-allowed"
                        >
                          Certificado pendiente
                        </button>
                      )}

                    {(registration.status === 'registered' ||
                      registration.status === 'confirmed') && (
                      <button
                        onClick={() => handleCancelRegistration(registration.id)}
                        className="flex-1 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-center font-medium transition-colors"
                      >
                        Cancelar inscripción
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
