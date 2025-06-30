import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  orderBy,
  Timestamp,
  Query
} from 'firebase/firestore';
import type { DocumentData } from 'firebase/firestore';
import { db } from '@/core/firebase/config';
import { v4 as uuidv4 } from 'uuid';

const COLLECTION_NAME = 'subscribers';

export interface Subscriber {
  id: string;
  firstName: string;
  lastName?: string;
  name?: string;
  email: string;
  createdAt: Timestamp;
  active: boolean;
  deleted?: boolean;
  source?: 'web' | 'auth_sync' | 'auth_auto' | 'manual';
  authUid?: string;
  unsubscribeToken?: string;
  syncedAt?: Timestamp;
}

// Obtener todos los suscriptores
export async function getAllSubscribers(activeOnly = true): Promise<Subscriber[]> {
  try {
    let subscribersQuery: Query<DocumentData>;
    
    if (activeOnly) {
      subscribersQuery = query(
        collection(db, COLLECTION_NAME),
        where('active', '==', true),
        orderBy('createdAt', 'desc')
      );
    } else {
      subscribersQuery = query(
        collection(db, COLLECTION_NAME),
        orderBy('createdAt', 'desc')
      );
    }
    
    const snapshot = await getDocs(subscribersQuery);
    return snapshot.docs.map(doc => {
      const data = doc.data() as Omit<Subscriber, 'id'>;
      return {
        id: doc.id,
        ...data
      } as Subscriber;
    });
  } catch (error) {
    console.error('Error al obtener suscriptores:', error);
    throw error;
  }
}

// Verificar si un email ya está suscrito
export async function isEmailSubscribed(email: string): Promise<boolean> {
  try {
    const subscribersQuery = query(
      collection(db, COLLECTION_NAME),
      where('email', '==', email.toLowerCase()),
      where('active', '==', true)
    );
    
    const snapshot = await getDocs(subscribersQuery);
    return !snapshot.empty;
  } catch (error) {
    console.error(`Error al verificar si ${email} está suscrito:`, error);
    throw error;
  }
}

// Suscribir un nuevo email
export async function subscribe(email: string, name?: string): Promise<Subscriber> {
  try {
    // Verificar si ya existe
    const isAlreadySubscribed = await isEmailSubscribed(email);
    
    if (isAlreadySubscribed) {
      throw new Error('Este email ya está suscrito al newsletter');
    }
    
    // Crear token para cancelar suscripción
    const unsubscribeToken = uuidv4();
    
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      email: email.toLowerCase(),
      name: name || '',
      createdAt: serverTimestamp(),
      active: true,
      unsubscribeToken
    });
    
    const newSubscriber = await getDoc(docRef);
    const data = newSubscriber.data() as Omit<Subscriber, 'id'>;
    
    return {
      id: docRef.id,
      ...data
    } as Subscriber;
  } catch (error) {
    console.error('Error al suscribir email:', error);
    throw error;
  }
}

// Cancelar suscripción por token
export async function unsubscribeByToken(token: string) {
  try {
    const subscribersQuery = query(
      collection(db, COLLECTION_NAME),
      where('unsubscribeToken', '==', token),
      where('active', '==', true)
    );
    
    const snapshot = await getDocs(subscribersQuery);
    
    if (snapshot.empty) {
      return false;
    }
    
    const subscriberDoc = snapshot.docs[0];
    await updateDoc(doc(db, COLLECTION_NAME, subscriberDoc.id), {
      active: false,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error(`Error al cancelar suscripción con token ${token}:`, error);
    throw error;
  }
}

// Cancelar suscripción por email (para uso administrativo)
export async function unsubscribeByEmail(email: string) {
  try {
    const subscribersQuery = query(
      collection(db, COLLECTION_NAME),
      where('email', '==', email.toLowerCase()),
      where('active', '==', true)
    );
    
    const snapshot = await getDocs(subscribersQuery);
    
    if (snapshot.empty) {
      return false;
    }
    
    const subscriberDoc = snapshot.docs[0];
    await updateDoc(doc(db, COLLECTION_NAME, subscriberDoc.id), {
      active: false,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error(`Error al cancelar suscripción de ${email}:`, error);
    throw error;
  }
}

// Eliminar un suscriptor (solo para uso administrativo)
export async function deleteSubscriber(id: string) {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error al eliminar suscriptor ${id}:`, error);
    throw error;
  }
} 