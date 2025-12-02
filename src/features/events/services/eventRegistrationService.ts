/**
 * Servicio para gestionar inscripciones a eventos
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/core/firebase/config';
import type { EventRegistration } from '@/features/events/types';
import { EventService } from './eventService';
import { MercadoPagoService } from '@/features/payments';

const REGISTRATIONS_COLLECTION = 'event_registrations';

// Helper para convertir Timestamps
const convertTimestamp = (data: any): any => {
  if (!data) return data;

  const converted = { ...data };
  Object.keys(converted).forEach((key) => {
    if (converted[key] instanceof Timestamp) {
      converted[key] = converted[key].toDate();
    }
  });
  return converted;
};

// Helper para remover valores undefined recursivamente (Firestore no los permite)
const removeUndefined = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;

  const cleaned: any = {};
  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    if (value !== undefined) {
      // Si es un objeto anidado, limpiar recursivamente
      if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        cleaned[key] = removeUndefined(value);
      } else {
        cleaned[key] = value;
      }
    }
  });
  return cleaned;
};

export class EventRegistrationService {
  /**
   * Registrar un usuario a un evento
   */
  static async registerToEvent(
    userId: string,
    userEmail: string,
    userName: string,
    eventId: string,
    additionalInfo?: any
  ): Promise<string> {
    try {
      console.log('[EventRegistration] Iniciando registro - Usuario:', userId, 'Evento:', eventId);

      // Verificar si el evento existe y tiene cupos
      const event = await EventService.getEventById(eventId);
      if (!event) {
        console.error('[EventRegistration] Evento no encontrado:', eventId);
        throw new Error('Evento no encontrado');
      }

      console.log('[EventRegistration] Evento encontrado:', event.title);

      if (!EventService.isRegistrationOpen(event)) {
        console.warn('[EventRegistration] Inscripciones cerradas para:', eventId);
        throw new Error('Las inscripciones están cerradas para este evento');
      }

      const hasSpots = await EventService.hasAvailableSpots(eventId);
      if (!hasSpots) {
        console.warn('[EventRegistration] Sin cupos disponibles para:', eventId);
        throw new Error('No hay cupos disponibles');
      }

      // Verificar si ya está registrado
      const existingRegistration = await this.getUserRegistrationForEvent(userId, eventId);
      if (existingRegistration && existingRegistration.status !== 'cancelled') {
        console.warn('[EventRegistration] Usuario ya registrado:', userId, eventId);
        throw new Error('Ya estás registrado en este evento');
      }

      // Determinar si requiere pago
      const requiresPayment = !event.isFree;
      console.log('[EventRegistration] Requiere pago:', requiresPayment);

      // Crear registro
      const registrationData: Omit<EventRegistration, 'id'> = {
        userId,
        userEmail,
        userName,
        eventId,
        eventTitle: event.title,
        status: requiresPayment ? 'registered' : 'confirmed',
        registrationDate: new Date(),
        certificateIssued: false,
        paymentRequired: requiresPayment,
        paymentStatus: requiresPayment ? 'pending' : undefined,
        additionalInfo,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Remover valores undefined antes de enviar a Firestore
      const cleanData = removeUndefined({
        ...registrationData,
        registrationDate: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log('[EventRegistration] Guardando registro en Firestore...');
      const docRef = await addDoc(collection(db, REGISTRATIONS_COLLECTION), cleanData);
      console.log('[EventRegistration] Registro guardado con ID:', docRef.id);

      // Incrementar contador de participantes
      await EventService.incrementParticipants(eventId);
      console.log('[EventRegistration] Contador de participantes incrementado');

      return docRef.id;
    } catch (error: any) {
      console.error('[EventRegistration] Error en registerToEvent:', error);
      throw error; // Re-lanzar el error original para mantener el mensaje específico
    }
  }

  /**
   * Registrar a evento con pago
   */
  static async registerWithPayment(
    userId: string,
    userEmail: string,
    userName: string,
    eventId: string,
    additionalInfo?: any
  ): Promise<{ registrationId: string; preferenceId: string; initPoint: string }> {
    try {
      // Crear registro primero
      console.log('[EventRegistration] Creando registro para evento:', eventId, 'usuario:', userId);
      const registrationId = await this.registerToEvent(
        userId,
        userEmail,
        userName,
        eventId,
        additionalInfo
      );
      console.log('[EventRegistration] Registro creado exitosamente:', registrationId);

      // Obtener evento para el precio
      const event = await EventService.getEventById(eventId);
      if (!event) {
        console.error('[EventRegistration] Evento no encontrado:', eventId);
        throw new Error('Evento no encontrado');
      }

      // Crear preferencia de pago en Mercado Pago
      console.log('[EventRegistration] Creando preferencia de pago para:', event.price);
      const preference = await MercadoPagoService.createEventRegistrationPreference(
        eventId,
        userId,
        event.price || 0
      );
      console.log('[EventRegistration] Preferencia creada:', preference.id);

      // Actualizar registro con ID de preferencia
      try {
        await this.updateRegistration(registrationId, {
          paymentId: preference.id,
        });
        console.log('[EventRegistration] PaymentId actualizado en registro');
      } catch (updateError: any) {
        console.error('[EventRegistration] Error al actualizar paymentId:', updateError);
        // No lanzar error aquí - el registro ya se creó exitosamente
        // El paymentId se puede actualizar después mediante webhook
      }

      return {
        registrationId,
        preferenceId: preference.id,
        initPoint: preference.init_point || '',
      };
    } catch (error: any) {
      console.error('[EventRegistration] Error en registerWithPayment:', error);
      throw new Error(error.message || 'Error al procesar el registro con pago');
    }
  }

  /**
   * Obtener registro de un usuario para un evento
   */
  static async getUserRegistrationForEvent(
    userId: string,
    eventId: string
  ): Promise<EventRegistration | null> {
    const q = query(
      collection(db, REGISTRATIONS_COLLECTION),
      where('userId', '==', userId),
      where('eventId', '==', eventId)
    );

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;

    const doc = querySnapshot.docs[0];
    return convertTimestamp({ id: doc.id, ...doc.data() });
  }

  /**
   * Obtener todos los registros de un usuario
   */
  static async getUserRegistrations(userId: string): Promise<EventRegistration[]> {
    const q = query(
      collection(db, REGISTRATIONS_COLLECTION),
      where('userId', '==', userId),
      orderBy('registrationDate', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) =>
      convertTimestamp({ id: doc.id, ...doc.data() })
    );
  }

  /**
   * Obtener todos los registros de un evento
   */
  static async getEventRegistrations(eventId: string): Promise<EventRegistration[]> {
    const q = query(
      collection(db, REGISTRATIONS_COLLECTION),
      where('eventId', '==', eventId),
      orderBy('registrationDate', 'asc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) =>
      convertTimestamp({ id: doc.id, ...doc.data() })
    );
  }

  /**
   * Actualizar estado de registro
   */
  static async updateRegistrationStatus(
    registrationId: string,
    status: EventRegistration['status']
  ): Promise<void> {
    const docRef = doc(db, REGISTRATIONS_COLLECTION, registrationId);
    const updates: any = {
      status,
      updatedAt: serverTimestamp(),
    };

    if (status === 'confirmed') {
      updates.confirmationDate = serverTimestamp();
    } else if (status === 'attended') {
      updates.attendanceDate = serverTimestamp();
    } else if (status === 'cancelled') {
      updates.cancellationDate = serverTimestamp();
    }

    await updateDoc(docRef, updates);
  }

  /**
   * Confirmar pago de registro
   */
  static async confirmPayment(
    registrationId: string,
    paymentId: string
  ): Promise<void> {
    const docRef = doc(db, REGISTRATIONS_COLLECTION, registrationId);
    await updateDoc(docRef, {
      status: 'confirmed',
      paymentStatus: 'paid',
      paymentId,
      confirmationDate: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Cancelar registro
   */
  static async cancelRegistration(
    registrationId: string,
    reason?: string
  ): Promise<void> {
    const registration = await this.getRegistrationById(registrationId);
    if (!registration) {
      throw new Error('Registro no encontrado');
    }

    // Actualizar registro
    await updateDoc(doc(db, REGISTRATIONS_COLLECTION, registrationId), {
      status: 'cancelled',
      cancellationDate: serverTimestamp(),
      cancellationReason: reason,
      updatedAt: serverTimestamp(),
    });

    // Decrementar contador de participantes
    await EventService.decrementParticipants(registration.eventId);
  }

  /**
   * Marcar asistencia
   */
  static async markAttendance(registrationId: string): Promise<void> {
    await updateDoc(doc(db, REGISTRATIONS_COLLECTION, registrationId), {
      status: 'attended',
      attendanceDate: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Obtener registro por ID
   */
  static async getRegistrationById(
    registrationId: string
  ): Promise<EventRegistration | null> {
    const docRef = doc(db, REGISTRATIONS_COLLECTION, registrationId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return convertTimestamp({ id: docSnap.id, ...docSnap.data() });
  }

  /**
   * Actualizar registro
   */
  static async updateRegistration(
    registrationId: string,
    data: Partial<EventRegistration>
  ): Promise<void> {
    try {
      const docRef = doc(db, REGISTRATIONS_COLLECTION, registrationId);

      // Remover valores undefined antes de enviar a Firestore
      const cleanData = removeUndefined({
        ...data,
        updatedAt: serverTimestamp(),
      });

      console.log('[EventRegistration] Actualizando registro:', registrationId, 'con datos:', Object.keys(cleanData));
      await updateDoc(docRef, cleanData);
      console.log('[EventRegistration] Registro actualizado exitosamente');
    } catch (error: any) {
      console.error('[EventRegistration] Error al actualizar registro:', registrationId, error);

      // Proporcionar mensaje de error más descriptivo
      if (error.code === 'permission-denied') {
        throw new Error('No tienes permisos para actualizar este registro. Por favor contacta al administrador.');
      } else if (error.code === 'not-found') {
        throw new Error('El registro no fue encontrado.');
      } else {
        throw new Error(`Error al actualizar el registro: ${error.message}`);
      }
    }
  }

  /**
   * Obtener estad�sticas de un evento
   */
  static async getEventStats(eventId: string): Promise<{
    totalRegistrations: number;
    confirmed: number;
    attended: number;
    cancelled: number;
    pending: number;
  }> {
    const registrations = await this.getEventRegistrations(eventId);

    return {
      totalRegistrations: registrations.length,
      confirmed: registrations.filter((r) => r.status === 'confirmed').length,
      attended: registrations.filter((r) => r.status === 'attended').length,
      cancelled: registrations.filter((r) => r.status === 'cancelled').length,
      pending: registrations.filter((r) => r.status === 'registered').length,
    };
  }
}
