import { db } from '../core/firebase/config';
import { collection, addDoc, query, where, getDocs, Timestamp, doc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';

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
 * Obtiene todos los suscriptores de la base de datos, con opciones de filtrado y ordenación.
 * Esta versión utiliza consultas de Firestore para un rendimiento óptimo.
 * @param includeDeleted Si es true, incluye también los suscriptores marcados como eliminados
 * @returns Promise con el array de suscriptores
 */
export const getSubscribers = async (includeDeleted: boolean = false): Promise<(Subscriber & { id: string })[]> => {
  try {
    const subscribersRef = collection(db, SUBSCRIBERS_COLLECTION);
    
    // Se construye la consulta dinámicamente para delegar el trabajo a Firestore.
    // NOTA: Esto requiere los índices compuestos definidos en FIRESTORE_SETUP.md.
    const queryConstraints = [orderBy('createdAt', 'desc')];
    if (!includeDeleted) {
      // El índice para esta consulta es: `deleted` (Asc) y `createdAt` (Desc).
      queryConstraints.unshift(where('deleted', '!=', true));
    }

    const q = query(subscribersRef, ...queryConstraints);
    const querySnapshot = await getDocs(q);
    
    // Mapear los documentos directamente. El filtrado y la ordenación ya se hicieron en el servidor.
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Subscriber
    }));
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
 * Realiza un borrado lógico (soft delete) de un suscriptor.
 * Esta operación debe ser realizada por un administrador.
 * @param subscriberId ID del suscriptor
 */
export const deleteSubscriber = async (subscriberId: string): Promise<void> => {
  try {
    const { auth } = await import('../core/firebase/config');
    
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Usuario no autenticado. Debes iniciar sesión para realizar esta acción.');
    }
    
    // FIXME: La comprobación de permisos está hardcodeada.
    // Esto es inseguro y difícil de mantener. Se debe reemplazar por un sistema de roles,
    // por ejemplo, usando Custom Claims de Firebase Auth.
    const adminEmails = ['alexandersilvera@hotmail.com', 'admin@centroumbandistareinodamata.org'];
    if (!adminEmails.includes(currentUser.email ?? '')) {
      throw new Error('No tienes permisos para eliminar suscriptores. Esta acción está reservada para administradores.');
    }

    console.log(`Admin ${currentUser.email} está intentando eliminar al suscriptor ${subscriberId}`);
    
    const docRef = doc(db, SUBSCRIBERS_COLLECTION, subscriberId);
    await updateDoc(docRef, { 
      active: false,
      deleted: true,
      deletedAt: Timestamp.now()
    });
    console.log('Suscriptor marcado como eliminado correctamente');
  } catch (error: any) {
    console.error('Error al eliminar suscriptor:', error);
    if (error.code) {
      console.error(`Código de error: ${error.code}, Mensaje: ${error.message}`);
    }
    throw error;
  }
}; 