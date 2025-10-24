/**
 * Servicio para gestionar eventos acad�micos
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
  limit,
  Timestamp,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { db } from '@/core/firebase/config';
import type { AcademicEvent } from '@/features/research/types';

const EVENTS_COLLECTION = 'academic_events';

// Helper para convertir Timestamps de Firestore a Date
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

// Helper para remover valores undefined (Firestore no los permite)
const removeUndefined = (obj: any): any => {
  const cleaned: any = {};
  Object.keys(obj).forEach((key) => {
    if (obj[key] !== undefined) {
      cleaned[key] = obj[key];
    }
  });
  return cleaned;
};

export class EventService {
  /**
   * Obtener TODOS los eventos (para admin)
   */
  static async getAllEvents(): Promise<AcademicEvent[]> {
    const q = query(
      collection(db, EVENTS_COLLECTION),
      orderBy('date', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) =>
      convertTimestamp({ id: doc.id, ...doc.data() })
    );
  }

  /**
   * Obtener todos los eventos publicados
   */
  static async getPublishedEvents(): Promise<AcademicEvent[]> {
    const q = query(
      collection(db, EVENTS_COLLECTION),
      where('status', '==', 'published'),
      where('isActive', '==', true),
      orderBy('date', 'asc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) =>
      convertTimestamp({ id: doc.id, ...doc.data() })
    );
  }

  /**
   * Obtener eventos destacados
   */
  static async getFeaturedEvents(limitCount: number = 3): Promise<AcademicEvent[]> {
    const q = query(
      collection(db, EVENTS_COLLECTION),
      where('status', '==', 'published'),
      where('featured', '==', true),
      where('isActive', '==', true),
      orderBy('date', 'asc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) =>
      convertTimestamp({ id: doc.id, ...doc.data() })
    );
  }

  /**
   * Obtener eventos pr�ximos (futuro)
   */
  static async getUpcomingEvents(limitCount?: number): Promise<AcademicEvent[]> {
    const now = new Date();

    try {
      // Intentar con la consulta completa (requiere índice)
      let q = query(
        collection(db, EVENTS_COLLECTION),
        where('status', '==', 'published'),
        where('date', '>=', now),
        where('isActive', '==', true),
        orderBy('date', 'asc')
      );

      if (limitCount) {
        q = query(q, limit(limitCount));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) =>
        convertTimestamp({ id: doc.id, ...doc.data() })
      );
    } catch (error: any) {
      // Si falla por falta de índice, usar consulta más simple y filtrar en cliente
      console.warn('Usando consulta simplificada (índice en construcción):', error.message);

      const q = query(
        collection(db, EVENTS_COLLECTION),
        where('status', '==', 'published'),
        where('isActive', '==', true)
      );

      const querySnapshot = await getDocs(q);
      let events = querySnapshot.docs.map((doc) =>
        convertTimestamp({ id: doc.id, ...doc.data() })
      );

      // Filtrar en cliente
      events = events
        .filter((event) => {
          const eventDate = event.date instanceof Date ? event.date : new Date(event.date);
          return eventDate >= now;
        })
        .sort((a, b) => {
          const dateA = a.date instanceof Date ? a.date : new Date(a.date);
          const dateB = b.date instanceof Date ? b.date : new Date(b.date);
          return dateA.getTime() - dateB.getTime();
        });

      if (limitCount) {
        events = events.slice(0, limitCount);
      }

      return events;
    }
  }

  /**
   * Obtener eventos por tipo
   */
  static async getEventsByType(
    eventType: AcademicEvent['type']
  ): Promise<AcademicEvent[]> {
    const q = query(
      collection(db, EVENTS_COLLECTION),
      where('type', '==', eventType),
      where('status', '==', 'published'),
      where('isActive', '==', true),
      orderBy('date', 'asc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) =>
      convertTimestamp({ id: doc.id, ...doc.data() })
    );
  }

  /**
   * Obtener un evento por ID
   */
  static async getEventById(eventId: string): Promise<AcademicEvent | null> {
    const docRef = doc(db, EVENTS_COLLECTION, eventId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return convertTimestamp({ id: docSnap.id, ...docSnap.data() });
  }

  /**
   * Crear un nuevo evento
   */
  static async createEvent(eventData: Omit<AcademicEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    // Remover valores undefined antes de enviar a Firestore
    const cleanData = removeUndefined({
      ...eventData,
      currentParticipants: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const docRef = await addDoc(collection(db, EVENTS_COLLECTION), cleanData);

    return docRef.id;
  }

  /**
   * Actualizar un evento
   */
  static async updateEvent(
    eventId: string,
    eventData: Partial<Omit<AcademicEvent, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<void> {
    const docRef = doc(db, EVENTS_COLLECTION, eventId);

    // Remover valores undefined antes de enviar a Firestore
    const cleanData = removeUndefined({
      ...eventData,
      updatedAt: serverTimestamp(),
    });

    await updateDoc(docRef, cleanData);
  }

  /**
   * Eliminar un evento (soft delete)
   */
  static async deleteEvent(eventId: string): Promise<void> {
    const docRef = doc(db, EVENTS_COLLECTION, eventId);
    await updateDoc(docRef, {
      isActive: false,
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Incrementar contador de participantes
   */
  static async incrementParticipants(eventId: string): Promise<void> {
    const docRef = doc(db, EVENTS_COLLECTION, eventId);
    await updateDoc(docRef, {
      currentParticipants: increment(1),
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Decrementar contador de participantes
   */
  static async decrementParticipants(eventId: string): Promise<void> {
    const docRef = doc(db, EVENTS_COLLECTION, eventId);
    await updateDoc(docRef, {
      currentParticipants: increment(-1),
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Verificar si un evento tiene cupos disponibles
   */
  static async hasAvailableSpots(eventId: string): Promise<boolean> {
    const event = await this.getEventById(eventId);
    if (!event) return false;

    if (!event.maxParticipants) return true; // Sin l�mite

    return event.currentParticipants < event.maxParticipants;
  }

  /**
   * Verificar si las inscripciones est�n abiertas
   */
  static isRegistrationOpen(event: AcademicEvent): boolean {
    const now = new Date();

    // Verificar estado
    if (event.status !== 'published') return false;

    // Verificar deadline
    if (event.registrationDeadline && now > event.registrationDeadline) {
      return false;
    }

    // Verificar fecha del evento
    if (now > event.date) return false;

    return true;
  }

  /**
   * Obtener eventos con filtros
   */
  static async getEventsWithFilters(filters: {
    type?: AcademicEvent['type'];
    isFree?: boolean;
    isOnline?: boolean;
    startDate?: Date;
    endDate?: Date;
  }): Promise<AcademicEvent[]> {
    let q = query(
      collection(db, EVENTS_COLLECTION),
      where('status', '==', 'published'),
      where('isActive', '==', true)
    );

    if (filters.type) {
      q = query(q, where('type', '==', filters.type));
    }

    if (filters.isFree !== undefined) {
      q = query(q, where('isFree', '==', filters.isFree));
    }

    if (filters.isOnline !== undefined) {
      q = query(q, where('isOnline', '==', filters.isOnline));
    }

    if (filters.startDate) {
      q = query(q, where('date', '>=', filters.startDate));
    }

    if (filters.endDate) {
      q = query(q, where('date', '<=', filters.endDate));
    }

    q = query(q, orderBy('date', 'asc'));

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) =>
      convertTimestamp({ id: doc.id, ...doc.data() })
    );
  }

  /**
   * Cambiar estado de un evento
   */
  static async updateEventStatus(
    eventId: string,
    status: AcademicEvent['status']
  ): Promise<void> {
    const docRef = doc(db, EVENTS_COLLECTION, eventId);
    await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Marcar/desmarcar evento como destacado
   */
  static async toggleFeatured(eventId: string, featured: boolean): Promise<void> {
    const docRef = doc(db, EVENTS_COLLECTION, eventId);
    await updateDoc(docRef, {
      featured,
      updatedAt: serverTimestamp(),
    });
  }
}
