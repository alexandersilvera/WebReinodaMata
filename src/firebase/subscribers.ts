import { db } from '../core/firebase/config';
import { collection, addDoc, query, where, getDocs, Timestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';

// Interfaz para los datos del suscriptor
export interface Subscriber { // Added export
  id: string;
  firstName: string;
  lastName?: string;
  email: string;
  createdAt: Timestamp;
  active: boolean;
  deleted?: boolean;
}

// Colección en Firestore
const SUBSCRIBERS_COLLECTION = 'subscribers';

/**
 * Añade un nuevo suscriptor a la base de datos
 * @param subscriberData Datos del suscriptor
 * @returns Promise con el ID del documento creado
 */
export const addSubscriber = async (subscriberData: Omit<Subscriber, 'id' | 'createdAt' | 'active'>): Promise<string> => {
  try {
    // Verificar si el correo ya existe
    const emailExists = await checkEmailExists(subscriberData.email);
    if (emailExists) {
      throw new Error('El correo electrónico ya está registrado');
    }
    
    // Crear documento con timestamp y estado activo
    const docRef = await addDoc(collection(db, SUBSCRIBERS_COLLECTION), {
      ...subscriberData,
      createdAt: Timestamp.now(),
      active: true
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error al añadir suscriptor:', error);
    throw error;
  }
};

/**
 * Verifica si un correo electrónico ya existe en la base de datos
 * @param email Correo electrónico a verificar
 * @returns Promise<boolean> - true si existe, false si no
 */
export const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    const q = query(
      collection(db, SUBSCRIBERS_COLLECTION),
      where('email', '==', email)
    );
    
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error al verificar email:', error);
    throw error;
  }
};

/**
 * Obtiene todos los suscriptores activos de la base de datos (no eliminados)
 * @param includeDeleted Si es true, incluye también los suscriptores marcados como eliminados
 * @returns Promise con el array de suscriptores
 */
export const getSubscribers = async (includeDeleted: boolean = false): Promise<(Subscriber & { id: string })[]> => {
  try {
    const subscribersRef = collection(db, SUBSCRIBERS_COLLECTION);
    const querySnapshot = await getDocs(subscribersRef);
    
    // Mapear los documentos y filtrar los eliminados si es necesario
    return querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data() as Subscriber
      }))
      .filter(subscriber => {
        // Si includeDeleted es true, devolver todos
        if (includeDeleted) return true;
        
        // Si no, filtrar los que tienen deleted=true
        return !subscriber.deleted;
      })
      // Ordenar por fecha de creación (más recientes primero)
      .sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
  } catch (error) {
    console.error('Error al obtener suscriptores:', error);
    throw error;
  }
};

/**
 * Actualiza el estado de un suscriptor (activo/inactivo)
 * @param subscriberId ID del suscriptor
 * @param active Nuevo estado
 */
export const updateSubscriberStatus = async (subscriberId: string, active: boolean): Promise<void> => {
  try {
    const docRef = doc(db, SUBSCRIBERS_COLLECTION, subscriberId);
    await updateDoc(docRef, { active });
  } catch (error: unknown) {
    console.error('Error al actualizar suscriptor:', error);
    if (error && typeof error === 'object' && 'code' in error) {
      console.error('Código de error:', (error as any).code);
      console.error('Mensaje de error:', (error as any).message);
    }
    throw error;
  }
};

/**
 * Elimina un suscriptor de la base de datos utilizando un enfoque alternativo
 * @param subscriberId ID del suscriptor
 */
export const deleteSubscriber = async (subscriberId: string): Promise<void> => {
  try {
    // Importar auth y functions para verificar autenticación y llamar a la función
    const { auth, functions } = await import('../core/firebase/config');
    const { httpsCallable } = await import('firebase/functions');
    
    // Verificar si el usuario está autenticado
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Usuario no autenticado. Debes iniciar sesión para realizar esta acción.');
    }
    
    console.log('Intentando eliminar suscriptor con ID:', subscriberId);
    console.log('Usuario autenticado:', currentUser.email);
    
    // Verificar si es el administrador
    if (currentUser.email !== 'alexandersilvera@hotmail.com') {
      throw new Error('No tienes permisos para eliminar suscriptores. Esta acción está reservada para administradores.');
    }
    
    // Enfoque alternativo: usar método de borrado temporal
    // En lugar de eliminar directamente, marcar como inactivo y eliminado
    const docRef = doc(db, SUBSCRIBERS_COLLECTION, subscriberId);
    await updateDoc(docRef, { 
      active: false,
      deleted: true,
      deletedAt: Timestamp.now()
    });
    
    console.log('Suscriptor marcado como eliminado correctamente');
  } catch (error) {
    console.error('Error al eliminar suscriptor:', error);
    // Añadir más detalles al error para facilitar la depuración
    if (error.code) {
      console.error('Código de error:', error.code);
      console.error('Mensaje de error:', error.message);
    }
    throw error;
  }
}; 