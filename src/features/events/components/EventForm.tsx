/**
 * Formulario para crear y editar eventos académicos
 */
import { useState, useEffect } from 'react';
import { EventService } from '../services/eventService';
import type { AcademicEvent } from '@/features/research/types';

interface EventFormProps {
  event?: AcademicEvent | null;
  onSuccess: () => void;
  onCancel: () => void;
}

type EventFormData = Omit<AcademicEvent, 'id' | 'createdAt' | 'updatedAt' | 'currentParticipants'>;

export default function EventForm({ event, onSuccess, onCancel }: EventFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    shortDescription: '',
    type: 'workshop',
    date: new Date(),
    duration: 2,
    location: '',
    isOnline: false,
    meetingLink: '',
    maxParticipants: undefined,
    registrationRequired: true,
    registrationDeadline: undefined,
    speakers: [],
    topics: [],
    materials: [],
    imageUrl: '',
    isFree: true,
    price: undefined,
    currency: 'ARS',
    requiresSubscription: false,
    allowedSubscriptionTiers: [],
    status: 'draft',
    featured: false,
    isActive: true,
  });

  const [speakerInput, setSpeakerInput] = useState('');
  const [topicInput, setTopicInput] = useState('');

  // Cargar datos del evento si estamos editando
  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description,
        shortDescription: event.shortDescription || '',
        type: event.type,
        date: event.date instanceof Date ? event.date : new Date(event.date),
        endDate: event.endDate ? (event.endDate instanceof Date ? event.endDate : new Date(event.endDate)) : undefined,
        duration: event.duration,
        location: event.location,
        isOnline: event.isOnline,
        meetingLink: event.meetingLink || '',
        maxParticipants: event.maxParticipants,
        registrationRequired: event.registrationRequired,
        registrationDeadline: event.registrationDeadline
          ? event.registrationDeadline instanceof Date
            ? event.registrationDeadline
            : new Date(event.registrationDeadline)
          : undefined,
        speakers: event.speakers || [],
        topics: event.topics || [],
        materials: event.materials || [],
        imageUrl: event.imageUrl || '',
        isFree: event.isFree,
        price: event.price,
        currency: event.currency || 'ARS',
        requiresSubscription: event.requiresSubscription || false,
        allowedSubscriptionTiers: event.allowedSubscriptionTiers || [],
        status: event.status,
        featured: event.featured || false,
        isActive: event.isActive,
      });
    }
  }, [event]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validaciones
      if (!formData.title.trim()) {
        throw new Error('El título es requerido');
      }
      if (!formData.description.trim()) {
        throw new Error('La descripción es requerida');
      }
      if (!formData.location.trim() && !formData.isOnline) {
        throw new Error('La ubicación es requerida para eventos presenciales');
      }
      if (formData.isOnline && !formData.meetingLink?.trim()) {
        throw new Error('El enlace de reunión es requerido para eventos en línea');
      }
      if (!formData.isFree && (!formData.price || formData.price <= 0)) {
        throw new Error('El precio debe ser mayor a 0 para eventos de pago');
      }

      if (event) {
        // Actualizar evento existente
        await EventService.updateEvent(event.id, formData);
      } else {
        // Crear nuevo evento - EventService.createEvent agrega currentParticipants automáticamente
        await EventService.createEvent(formData as any);
      }

      onSuccess();
    } catch (err: any) {
      console.error('Error al guardar evento:', err);
      setError(err.message || 'Error al guardar el evento');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData((prev) => ({ ...prev, [name]: value ? Number(value) : undefined }));
    } else if (type === 'datetime-local') {
      setFormData((prev) => ({ ...prev, [name]: value ? new Date(value) : undefined }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const addSpeaker = () => {
    if (speakerInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        speakers: [...prev.speakers, speakerInput.trim()],
      }));
      setSpeakerInput('');
    }
  };

  const removeSpeaker = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      speakers: prev.speakers.filter((_, i) => i !== index),
    }));
  };

  const addTopic = () => {
    if (topicInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        topics: [...prev.topics, topicInput.trim()],
      }));
      setTopicInput('');
    }
  };

  const removeTopic = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      topics: prev.topics.filter((_, i) => i !== index),
    }));
  };

  const formatDateForInput = (date?: Date) => {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);

    // Ajustar a la zona horaria local
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-900">
          {event ? 'Editar Evento' : 'Crear Nuevo Evento'}
        </h2>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Información básica */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Información Básica</h3>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Título <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Ej: Taller de Introducción a la Umbanda"
          />
        </div>

        <div>
          <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700 mb-1">
            Descripción Corta
          </label>
          <input
            type="text"
            id="shortDescription"
            name="shortDescription"
            value={formData.shortDescription}
            onChange={handleChange}
            maxLength={150}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Resumen breve (máx. 150 caracteres)"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Descripción Completa <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Descripción detallada del evento"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Evento <span className="text-red-500">*</span>
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="workshop">Taller</option>
              <option value="seminar">Seminario</option>
              <option value="conference">Conferencia</option>
              <option value="lecture">Charla</option>
              <option value="course">Curso</option>
              <option value="ceremony">Ceremonia</option>
              <option value="retreat">Retiro</option>
            </select>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="draft">Borrador</option>
              <option value="published">Publicado</option>
              <option value="registration_closed">Inscripciones Cerradas</option>
              <option value="in_progress">En Progreso</option>
              <option value="completed">Completado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
            URL de Imagen
          </label>
          <input
            type="url"
            id="imageUrl"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="https://ejemplo.com/imagen.jpg"
          />
        </div>
      </div>

      {/* Fecha y Horario */}
      <div className="space-y-4 border-t pt-4">
        <h3 className="text-lg font-semibold text-gray-900">Fecha y Horario</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Fecha y Hora de Inicio <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              id="date"
              name="date"
              value={formatDateForInput(formData.date)}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
              Fecha y Hora de Fin
            </label>
            <input
              type="datetime-local"
              id="endDate"
              name="endDate"
              value={formatDateForInput(formData.endDate)}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
              Duración (horas) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              required
              min="0.5"
              step="0.5"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="registrationDeadline" className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Límite de Inscripción
            </label>
            <input
              type="datetime-local"
              id="registrationDeadline"
              name="registrationDeadline"
              value={formatDateForInput(formData.registrationDeadline)}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Ubicación */}
      <div className="space-y-4 border-t pt-4">
        <h3 className="text-lg font-semibold text-gray-900">Ubicación</h3>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isOnline"
            name="isOnline"
            checked={formData.isOnline}
            onChange={handleChange}
            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
          />
          <label htmlFor="isOnline" className="ml-2 block text-sm text-gray-700">
            Evento en línea
          </label>
        </div>

        {formData.isOnline ? (
          <div>
            <label htmlFor="meetingLink" className="block text-sm font-medium text-gray-700 mb-1">
              Enlace de Reunión <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              id="meetingLink"
              name="meetingLink"
              value={formData.meetingLink}
              onChange={handleChange}
              required={formData.isOnline}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="https://meet.google.com/..."
            />
          </div>
        ) : (
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Ubicación <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required={!formData.isOnline}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Dirección del evento"
            />
          </div>
        )}
      </div>

      {/* Inscripciones */}
      <div className="space-y-4 border-t pt-4">
        <h3 className="text-lg font-semibold text-gray-900">Inscripciones</h3>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="registrationRequired"
            name="registrationRequired"
            checked={formData.registrationRequired}
            onChange={handleChange}
            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
          />
          <label htmlFor="registrationRequired" className="ml-2 block text-sm text-gray-700">
            Requiere inscripción previa
          </label>
        </div>

        <div>
          <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700 mb-1">
            Máximo de Participantes
          </label>
          <input
            type="number"
            id="maxParticipants"
            name="maxParticipants"
            value={formData.maxParticipants || ''}
            onChange={handleChange}
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Dejar vacío para ilimitado"
          />
        </div>
      </div>

      {/* Precio */}
      <div className="space-y-4 border-t pt-4">
        <h3 className="text-lg font-semibold text-gray-900">Precio</h3>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isFree"
            name="isFree"
            checked={formData.isFree}
            onChange={handleChange}
            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
          />
          <label htmlFor="isFree" className="ml-2 block text-sm text-gray-700">
            Evento gratuito
          </label>
        </div>

        {!formData.isFree && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Precio <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price || ''}
                onChange={handleChange}
                required={!formData.isFree}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                Moneda
              </label>
              <select
                id="currency"
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="ARS">ARS ($)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Expositores */}
      <div className="space-y-4 border-t pt-4">
        <h3 className="text-lg font-semibold text-gray-900">Expositores / Facilitadores</h3>

        <div className="flex gap-2">
          <input
            type="text"
            value={speakerInput}
            onChange={(e) => setSpeakerInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addSpeaker();
              }
            }}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Nombre del expositor"
          />
          <button
            type="button"
            onClick={addSpeaker}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Agregar
          </button>
        </div>

        {formData.speakers.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.speakers.map((speaker, index) => (
              <div
                key={index}
                className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full"
              >
                <span>{speaker}</span>
                <button
                  type="button"
                  onClick={() => removeSpeaker(index)}
                  className="text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Temas */}
      <div className="space-y-4 border-t pt-4">
        <h3 className="text-lg font-semibold text-gray-900">Temas a Tratar</h3>

        <div className="flex gap-2">
          <input
            type="text"
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTopic();
              }
            }}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Tema del evento"
          />
          <button
            type="button"
            onClick={addTopic}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Agregar
          </button>
        </div>

        {formData.topics.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.topics.map((topic, index) => (
              <div
                key={index}
                className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full"
              >
                <span>{topic}</span>
                <button
                  type="button"
                  onClick={() => removeTopic(index)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Opciones adicionales */}
      <div className="space-y-4 border-t pt-4">
        <h3 className="text-lg font-semibold text-gray-900">Opciones Adicionales</h3>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="featured"
            name="featured"
            checked={formData.featured}
            onChange={handleChange}
            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
          />
          <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
            Marcar como evento destacado
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
            Evento activo
          </label>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end gap-3 border-t pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {loading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          )}
          {loading ? 'Guardando...' : event ? 'Actualizar Evento' : 'Crear Evento'}
        </button>
      </div>
    </form>
  );
}
