/**
 * Componente de registro a evento académico - VERSIÓN SIMPLIFICADA
 */
import { useEffect, useState } from 'react';
import { EventService } from '../services/eventService';
import { EventRegistrationService } from '../services/eventRegistrationService';
import { formatDate } from '@/core/utils/dateUtils';
import type { AcademicEvent } from '@/features/research/types';
import { useAuth } from '@/core/hooks/useAuth';

interface EventRegistrationClientProps {
  eventId: string;
}

interface FormData {
  fullName: string;
  phone: string;
  interests: string[];
  institution?: string;
  role?: string;
  specialRequirements?: string;
}

type Step = 'info' | 'confirm' | 'processing' | 'success';

export default function EventRegistrationClient({ eventId }: EventRegistrationClientProps) {
  const [event, setEvent] = useState<AcademicEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>('info');
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const { user } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    phone: '',
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

    // Pre-llenar nombre si existe
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.displayName || ''
      }));
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

      if (!EventService.isRegistrationOpen(data)) {
        setError('Las inscripciones están cerradas para este evento');
        return;
      }

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
      setCurrentStep('processing');

      const additionalInfo: Record<string, any> = {
        phone: formData.phone,
        interests: formData.interests,
      };

      if (formData.institution) additionalInfo.institution = formData.institution;
      if (formData.role) additionalInfo.role = formData.role;
      if (formData.specialRequirements) additionalInfo.specialRequirements = formData.specialRequirements;

      if (event.isFree) {
        const registrationId = await EventRegistrationService.registerToEvent(
          user.uid,
          user.email || '',
          formData.fullName,
          eventId,
          additionalInfo
        );

        setCurrentStep('success');
        setTimeout(() => {
          window.location.href = `/mi-cuenta/mis-eventos?registered=${registrationId}`;
        }, 2000);
      } else {
        const result = await EventRegistrationService.registerWithPayment(
          user.uid,
          user.email || '',
          formData.fullName,
          eventId,
          additionalInfo
        );

        window.location.href = result.initPoint;
      }
    } catch (err: any) {
      console.error('Error submitting registration:', err);
      setError(err.message || 'Error al procesar la inscripción');
      setSubmitting(false);
      setCurrentStep('info');
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

  const handleNext = () => {
    // Validar campos obligatorios
    if (!formData.fullName.trim()) {
      setError('Por favor ingresa tu nombre completo');
      return;
    }

    if (!formData.phone.trim()) {
      setError('Por favor ingresa tu teléfono de contacto');
      return;
    }

    if (formData.interests.length === 0) {
      setError('Por favor selecciona al menos un tema de interés');
      return;
    }

    setError(null);
    setCurrentStep('confirm');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setCurrentStep('info');
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-blue-600 mb-6"></div>
        <p className="text-gray-700 text-xl font-medium">Cargando información del evento...</p>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20">
        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-8 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-red-500 mx-auto mb-4"
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
          <h3 className="text-2xl font-bold text-red-900 mb-3">{error}</h3>
          <a
            href={`/eventos/${eventId}`}
            className="mt-6 inline-block px-8 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors text-lg"
          >
            ← Volver al evento
          </a>
        </div>
      </div>
    );
  }

  const eventDate = event!.date instanceof Date ? event!.date : new Date(event!.date);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className={`flex items-center ${currentStep === 'info' ? 'text-blue-600' : 'text-green-600'}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${
                currentStep === 'info' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
              }`}>
                {currentStep === 'info' ? '1' : '✓'}
              </div>
              <span className="ml-2 font-bold hidden sm:inline">Tus datos</span>
            </div>

            <div className="w-16 h-1 bg-gray-300"></div>

            <div className={`flex items-center ${
              currentStep === 'confirm' ? 'text-blue-600' :
              currentStep === 'processing' || currentStep === 'success' ? 'text-green-600' : 'text-gray-400'
            }`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${
                currentStep === 'confirm' ? 'bg-blue-600 text-white' :
                currentStep === 'processing' || currentStep === 'success' ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                {currentStep === 'confirm' ? '2' : currentStep === 'processing' || currentStep === 'success' ? '✓' : '2'}
              </div>
              <span className="ml-2 font-bold hidden sm:inline">Confirmar</span>
            </div>
          </div>

          <div className="text-center text-gray-700 font-medium">
            {currentStep === 'info' && 'Paso 1 de 2: Completa tu información'}
            {currentStep === 'confirm' && 'Paso 2 de 2: Revisa y confirma'}
            {currentStep === 'processing' && 'Procesando tu inscripción...'}
            {currentStep === 'success' && '¡Inscripción exitosa!'}
          </div>
        </div>

        {/* Event Header Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-2 border-blue-100">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{event!.title}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formatDate(eventDate)}
                </span>
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {event!.duration} horas
                </span>
                <span className={`font-bold ${event!.isFree ? 'text-green-600' : 'text-blue-600'}`}>
                  {event!.isFree ? 'GRATUITO' : `${event!.currency === 'USD' ? '$' : event!.currency} ${event!.price?.toFixed(2)}`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Step 1: Information Form */}
        {currentStep === 'info' && (
          <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
              <span className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mr-3 text-xl">1</span>
              Inscríbete en 3 pasos
            </h2>
            <p className="text-gray-600 mb-8 ml-13">Solo necesitamos algunos datos básicos</p>

            {/* Campo 1: Nombre completo */}
            <div className="mb-6">
              <label className="block text-xl font-bold text-gray-900 mb-3">
                1. Tu nombre completo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Escribe tu nombre completo aquí"
                required
                className="w-full px-6 py-5 text-xl border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all"
              />
              <p className="text-sm text-gray-500 mt-2">Como aparecerá en tu certificado</p>
            </div>

            {/* Campo 2: Teléfono */}
            <div className="mb-6">
              <label className="block text-xl font-bold text-gray-900 mb-3">
                2. Teléfono de contacto <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+598 99 123 456"
                required
                className="w-full px-6 py-5 text-xl border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all"
              />
              <p className="text-sm text-gray-500 mt-2">Para enviarte recordatorios del evento</p>
            </div>

            {/* Campo 3: Temas de interés */}
            <div className="mb-8">
              <label className="block text-xl font-bold text-gray-900 mb-3">
                3. ¿Qué temas te interesan? <span className="text-red-500">*</span>
              </label>
              <p className="text-sm text-gray-600 mb-4">Selecciona al menos uno</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {['Religiones Afro', 'Derechos Humanos', 'Antirracismo', 'Antropología', 'Historia', 'Investigación'].map(
                  (interest) => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => handleInterestToggle(interest)}
                      className={`p-5 border-2 rounded-xl font-semibold transition-all text-left text-lg ${
                        formData.interests.includes(interest)
                          ? 'bg-blue-600 border-blue-600 text-white shadow-lg scale-105'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center mr-3 flex-shrink-0 ${
                          formData.interests.includes(interest)
                            ? 'bg-white border-white'
                            : 'bg-white border-gray-300'
                        }`}>
                          {formData.interests.includes(interest) && (
                            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <span>{interest}</span>
                      </div>
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Campos opcionales - Colapsables */}
            <div className="mb-8 border-t-2 border-gray-200 pt-6">
              <button
                type="button"
                onClick={() => setShowOptionalFields(!showOptionalFields)}
                className="flex items-center justify-between w-full text-left p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <span className="text-lg font-semibold text-gray-700">
                  Información adicional (opcional)
                </span>
                <svg
                  className={`w-6 h-6 text-gray-500 transition-transform ${showOptionalFields ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showOptionalFields && (
                <div className="mt-6 space-y-5 bg-gray-50 p-6 rounded-xl">
                  <div>
                    <label className="block text-base font-semibold text-gray-700 mb-2">
                      Institución u organización
                    </label>
                    <input
                      type="text"
                      value={formData.institution || ''}
                      onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                      placeholder="Ejemplo: Universidad de la República"
                      className="w-full px-5 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-base font-semibold text-gray-700 mb-2">
                      Tu rol u ocupación
                    </label>
                    <input
                      type="text"
                      value={formData.role || ''}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      placeholder="Ejemplo: Estudiante, Investigador, Activista..."
                      className="w-full px-5 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-base font-semibold text-gray-700 mb-2">
                      Necesidades especiales
                    </label>
                    <textarea
                      value={formData.specialRequirements || ''}
                      onChange={(e) => setFormData({ ...formData, specialRequirements: e.target.value })}
                      rows={3}
                      placeholder="Accesibilidad, restricciones alimentarias, etc."
                      className="w-full px-5 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all resize-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-5 bg-red-50 border-2 border-red-300 rounded-xl flex items-start">
                <svg className="w-7 h-7 text-red-600 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-800 text-lg font-medium">{error}</p>
              </div>
            )}

            {/* User email info */}
            <div className="mb-6 p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
              <p className="text-sm text-blue-900">
                <strong>Tu correo:</strong> {user?.email}
              </p>
              <p className="text-xs text-blue-700 mt-1">Te enviaremos la confirmación a este correo</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <a
                href={`/eventos/${eventId}`}
                className="flex-1 px-6 py-5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-bold text-xl text-center transition-all"
              >
                Cancelar
              </a>
              <button
                type="submit"
                className="flex-1 px-6 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xl transition-all shadow-lg hover:shadow-xl"
              >
                Continuar →
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Confirmation */}
        {currentStep === 'confirm' && (
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
              <span className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mr-3 text-xl">2</span>
              Confirma tu inscripción
            </h2>
            <p className="text-gray-600 mb-6 ml-13">Revisa que todo esté correcto</p>

            {/* Summary */}
            <div className="space-y-4 mb-8">
              <div className="p-5 bg-gray-50 rounded-xl border-2 border-gray-200">
                <p className="text-sm font-semibold text-gray-600 mb-2">Evento</p>
                <p className="text-xl font-bold text-gray-900">{event!.title}</p>
                <p className="text-base text-gray-600 mt-1">{formatDate(eventDate)} • {event!.duration} horas</p>
              </div>

              <div className="p-5 bg-gray-50 rounded-xl border-2 border-gray-200">
                <p className="text-sm font-semibold text-gray-600 mb-2">Participante</p>
                <p className="text-xl font-bold text-gray-900">{formData.fullName}</p>
                <p className="text-base text-gray-600 mt-1">{user?.email}</p>
                <p className="text-base text-gray-600">{formData.phone}</p>
              </div>

              <div className="p-5 bg-gray-50 rounded-xl border-2 border-gray-200">
                <p className="text-sm font-semibold text-gray-600 mb-2">Temas de interés</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.interests.map((interest) => (
                    <span key={interest} className="px-4 py-2 bg-blue-100 text-blue-900 rounded-full text-base font-medium">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              {(formData.institution || formData.role || formData.specialRequirements) && (
                <div className="p-5 bg-gray-50 rounded-xl border-2 border-gray-200">
                  <p className="text-sm font-semibold text-gray-600 mb-2">Información adicional</p>
                  {formData.institution && <p className="text-base text-gray-800 mt-1">• {formData.institution}</p>}
                  {formData.role && <p className="text-base text-gray-800 mt-1">• {formData.role}</p>}
                  {formData.specialRequirements && <p className="text-base text-gray-800 mt-1">• {formData.specialRequirements}</p>}
                </div>
              )}

              <div className="p-6 bg-blue-600 rounded-xl text-white border-2 border-blue-700">
                <p className="text-sm font-semibold mb-2">Costo de inscripción</p>
                <p className="text-4xl font-bold">
                  {event!.isFree ? 'GRATUITO' : `${event!.currency === 'USD' ? '$' : event!.currency} ${event!.price?.toFixed(2)}`}
                </p>
              </div>
            </div>

            {/* Terms */}
            <div className="mb-6 p-5 bg-yellow-50 rounded-xl border-2 border-yellow-300">
              <p className="text-base text-yellow-900 leading-relaxed">
                ✓ Al confirmar aceptas nuestros{' '}
                <a href="/terminos" className="text-yellow-800 underline font-bold">términos y condiciones</a>.
                {' '}Recibirás un correo de confirmación.
                {!event!.isFree && ' Serás redirigido a Mercado Pago para el pago seguro.'}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-5 bg-red-50 border-2 border-red-300 rounded-xl flex items-start">
                <svg className="w-7 h-7 text-red-600 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-800 text-lg font-medium">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleBack}
                disabled={submitting}
                className="flex-1 px-6 py-5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-bold text-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Atrás
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 px-6 py-5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Procesando...' : event!.isFree ? '✓ Confirmar' : '✓ Ir al Pago'}
              </button>
            </div>
          </div>
        )}

        {/* Processing */}
        {currentStep === 'processing' && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border-2 border-blue-100">
            <div className="animate-spin rounded-full h-24 w-24 border-b-4 border-blue-600 mx-auto mb-6"></div>
            <h3 className="text-3xl font-bold text-gray-900 mb-3">Procesando...</h3>
            <p className="text-gray-600 text-xl">Espera un momento por favor</p>
          </div>
        )}

        {/* Success */}
        {currentStep === 'success' && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border-2 border-green-200">
            <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-4xl font-bold text-green-600 mb-4">¡Listo!</h3>
            <p className="text-gray-700 text-xl mb-2">Te inscribiste correctamente</p>
            <p className="text-gray-600 text-lg">Revisa tu correo</p>
          </div>
        )}
      </div>
    </div>
  );
}
