/**
 * Componente de registro a evento académico
 */
import { useEffect, useState } from 'react';
import { EventService } from '../services/eventService';
import { EventRegistrationService } from '../services/eventRegistrationService';
import { formatDate, formatDateTime } from '@/core/utils/dateUtils';
import type { AcademicEvent } from '@/features/research/types';
import { useAuth } from '@/core/hooks/useAuth';

interface EventRegistrationClientProps {
  eventId: string;
}

interface FormData {
  phone?: string;
  institution?: string;
  role?: string;
  interests: string[];
  specialRequirements?: string;
}

export default function EventRegistrationClient({ eventId }: EventRegistrationClientProps) {
  const [event, setEvent] = useState<AcademicEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    interests: [],
  });

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  useEffect(() => {
    // Redirigir si no hay usuario
    if (!loading && !user) {
      window.location.href = `/login?redirect=/eventos/${eventId}/registro`;
    }
  }, [user, loading]);

  const loadEvent = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await EventService.getEventById(eventId);

      if (!data) {
        setError('Evento no encontrado');
        return;
      }

      // Verificar si las inscripciones están abiertas
      if (!EventService.isRegistrationOpen(data)) {
        setError('Las inscripciones están cerradas para este evento');
        return;
      }

      // Verificar cupos
      const hasSpots = await EventService.hasAvailableSpots(eventId);
      if (!hasSpots) {
        setError('No hay cupos disponibles');
        return;
      }

      setEvent(data);
    } catch (err) {
      console.error('Error loading event:', err);
      setError('No se pudo cargar el evento.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !event) return;

    try {
      setSubmitting(true);
      setError(null);

      const additionalInfo = {
        phone: formData.phone,
        institution: formData.institution,
        role: formData.role,
        interests: formData.interests,
        specialRequirements: formData.specialRequirements,
      };

      if (event.isFree) {
        // Registro gratuito directo
        const registrationId = await EventRegistrationService.registerToEvent(
          user.uid,
          user.email || '',
          user.displayName || user.email || 'Usuario',
          eventId,
          additionalInfo
        );

        // Redirigir a confirmación
        window.location.href = `/mi-cuenta/mis-eventos?registered=${registrationId}`;
      } else {
        // Registro con pago - crear preferencia de Mercado Pago
        const result = await EventRegistrationService.registerWithPayment(
          user.uid,
          user.email || '',
          user.displayName || user.email || 'Usuario',
          eventId,
          additionalInfo
        );

        // Redirigir a Mercado Pago
        window.location.href = result.initPoint;
      }
    } catch (err: any) {
      console.error('Error submitting registration:', err);
      setError(err.message || 'Error al procesar la inscripción');
      setSubmitting(false);
    }
  };

  const handleInterestToggle = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600 text-lg">Cargando...</p>
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
              <h3 className="text-lg font-bold text-red-900 mb-1">{error}</h3>
              <a
                href={`/eventos/${eventId}`}
                className="mt-3 inline-block text-sm text-red-600 hover:text-red-700 font-medium underline"
              >
                Volver al evento
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const eventDate = event.date instanceof Date ? event.date : new Date(event.date);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex text-sm text-gray-600 mb-6">
          <a href="/" className="hover:text-blue-600">Inicio</a>
          <span className="mx-2">/</span>
          <a href="/eventos" className="hover:text-blue-600">Eventos</a>
          <span className="mx-2">/</span>
          <a href={`/eventos/${eventId}`} className="hover:text-blue-600">{event.title}</a>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">Inscripción</span>
        </nav>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Inscripción al Evento
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center">
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
              {formatDate(eventDate)}
            </div>
            <div className="flex items-center">
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
              {event.duration} horas
            </div>
            <div className="flex items-center font-bold">
              {event.isFree ? (
                <span className="text-green-600">Gratuito</span>
              ) : (
                <span className="text-blue-600">
                  {event.currency === 'USD' ? '$' : event.currency} {event.price?.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Event Summary */}
        <div className="bg-blue-50 border-l-4 border-blue-600 rounded-r-lg p-6 mb-6">
          <h2 className="font-bold text-blue-900 mb-2">{event.title}</h2>
          <p className="text-blue-800 text-sm">{event.shortDescription || event.description}</p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Información del Participante
          </h2>

          {/* User Info (readonly) */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre completo
              </label>
              <input
                type="text"
                value={user?.displayName || user?.email || ''}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>
          </div>

          {/* Optional Fields */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono <span className="text-gray-500">(opcional)</span>
              </label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+598 99 123 456"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Institución <span className="text-gray-500">(opcional)</span>
              </label>
              <input
                type="text"
                value={formData.institution || ''}
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                placeholder="Ej: Universidad de la República"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rol/Ocupación <span className="text-gray-500">(opcional)</span>
            </label>
            <input
              type="text"
              value={formData.role || ''}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              placeholder="Ej: Estudiante, Investigador, Activista..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Interests */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Áreas de interés <span className="text-gray-500">(selecciona las que apliquen)</span>
            </label>
            <div className="grid md:grid-cols-2 gap-3">
              {['Religiones Afro', 'Derechos Humanos', 'Antirracismo', 'Antropología', 'Historia', 'Investigación'].map(
                (interest) => (
                  <label
                    key={interest}
                    className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.interests.includes(interest)}
                      onChange={() => handleInterestToggle(interest)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-sm text-gray-700">{interest}</span>
                  </label>
                )
              )}
            </div>
          </div>

          {/* Special Requirements */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Requerimientos especiales <span className="text-gray-500">(opcional)</span>
            </label>
            <textarea
              value={formData.specialRequirements || ''}
              onChange={(e) =>
                setFormData({ ...formData, specialRequirements: e.target.value })
              }
              rows={4}
              placeholder="Indica si tienes alguna necesidad especial (accesibilidad, restricciones alimentarias, etc.)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Terms */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">
              Al inscribirte aceptas nuestros{' '}
              <a href="/terminos" className="text-blue-600 hover:underline">
                términos y condiciones
              </a>
              . Recibirás un correo de confirmación con los detalles del evento.
              {!event.isFree && ' Serás redirigido a Mercado Pago para completar el pago.'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-4">
            <a
              href={`/eventos/${eventId}`}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-center transition-colors"
            >
              Cancelar
            </a>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Procesando...
                </span>
              ) : event.isFree ? (
                'Confirmar Inscripción'
              ) : (
                'Continuar al Pago'
              )}
            </button>
          </div>
        </form>

        {/* Payment Info */}
        {!event.isFree && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg p-6">
            <div className="flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-yellow-600 mr-3 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h3 className="text-lg font-bold text-yellow-900 mb-2">
                  Información de Pago
                </h3>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Procesamos pagos de forma segura con Mercado Pago</li>
                  <li>• Tu inscripción será confirmada automáticamente al completar el pago</li>
                  <li>• Recibirás un comprobante por email</li>
                  <li>
                    • Precio: {event.currency === 'USD' ? '$' : event.currency}{' '}
                    {event.price?.toFixed(2)}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
