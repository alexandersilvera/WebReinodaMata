import { db } from '@/core/firebase/config';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs
  // doc, getDoc, QuerySnapshot - available but not used
} from 'firebase/firestore';
// import type { DocumentData } from 'firebase/firestore'; - available but not used

/**
 * Utilidades para consultas de Firestore optimizadas
 */

// Tipos
export interface SubscriberStats {
  total: number;
  active: number;
  inactive: number;
  deleted: number;
}

export interface ArticleStats {
  total: number;
  published: number;
  drafts: number;
  featured: number;
}

/**
 * Obtener estadísticas de suscriptores de manera eficiente
 */
export async function getSubscriberStats(): Promise<SubscriberStats> {
  try {
    const subscribersRef = collection(db, 'subscribers');
    
    // Obtener todos los documentos y filtrar en el cliente
    // Esto evita la necesidad de índices compuestos
    const snapshot = await getDocs(subscribersRef);
    
    let total = 0;
    let active = 0;
    let inactive = 0;
    let deleted = 0;
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      
      if (data.deleted === true) {
        deleted++;
      } else {
        total++;
        if (data.active === true) {
          active++;
        } else {
          inactive++;
        }
      }
    });
    
    return { total, active, inactive, deleted };
  } catch (error) {
    console.error('Error al obtener estadísticas de suscriptores:', error);
    return { total: 0, active: 0, inactive: 0, deleted: 0 };
  }
}

/**
 * Obtener suscriptores activos (no eliminados y activos)
 */
export async function getActiveSubscribers() {
  try {
    const subscribersRef = collection(db, 'subscribers');
    
    // Usar consulta simple y filtrar en el cliente
    const snapshot = await getDocs(subscribersRef);
    
    const activeSubscribers = snapshot.docs
      .filter(doc => {
        const data = doc.data();
        return data.deleted !== true && data.active === true;
      })
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    
    return activeSubscribers;
  } catch (error) {
    console.error('Error al obtener suscriptores activos:', error);
    return [];
  }
}

/**
 * Obtener estadísticas de artículos
 */
export async function getArticleStats(): Promise<ArticleStats> {
  try {
    const articlesRef = collection(db, 'articles');
    const snapshot = await getDocs(articlesRef);
    
    let total = 0;
    let published = 0;
    let drafts = 0;
    let featured = 0;
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      total++;
      
      if (data.published === true) {
        published++;
      } else {
        drafts++;
      }
      
      if (data.featured === true) {
        featured++;
      }
    });
    
    return { total, published, drafts, featured };
  } catch (error) {
    console.error('Error al obtener estadísticas de artículos:', error);
    return { total: 0, published: 0, drafts: 0, featured: 0 };
  }
}

/**
 * Obtener artículos publicados con paginación
 */
export async function getPublishedArticles(limitCount: number = 10) {
  try {
    const articlesRef = collection(db, 'articles');
    
    // Usar consulta simple para artículos publicados
    const q = query(
      articlesRef,
      where('published', '==', true),
      orderBy('publishDate', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener artículos publicados:', error);
    return [];
  }
}

/**
 * Obtener borradores de artículos
 */
export async function getDraftArticles() {
  try {
    const articlesRef = collection(db, 'articles');
    
    // Usar consulta simple para borradores
    const q = query(
      articlesRef,
      where('published', '==', false),
      orderBy('updatedAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener borradores:', error);
    return [];
  }
}

/**
 * Verificar si un slug existe (excluyendo un documento específico)
 */
export async function checkSlugExists(slug: string, excludeId?: string): Promise<boolean> {
  try {
    const articlesRef = collection(db, 'articles');
    const q = query(articlesRef, where('slug', '==', slug));
    const snapshot = await getDocs(q);
    
    // Si no hay documentos con ese slug, está disponible
    if (snapshot.empty) {
      return false;
    }
    
    // Si hay documentos, verificar si alguno es diferente al excluido
    return snapshot.docs.some(doc => doc.id !== excludeId);
  } catch (error) {
    console.error('Error al verificar slug:', error);
    return false;
  }
}

/**
 * Obtener artículo por slug
 */
export async function getArticleBySlug(slug: string) {
  try {
    const articlesRef = collection(db, 'articles');
    const q = query(articlesRef, where('slug', '==', slug));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    };
  } catch (error) {
    console.error('Error al obtener artículo por slug:', error);
    return null;
  }
}

/**
 * Función de utilidad para manejar errores de Firestore
 */
export function handleFirestoreError(error: any): string {
  if (error.code === 'failed-precondition') {
    return 'Se requiere crear un índice en Firestore. Consulta la consola para más detalles.';
  } else if (error.code === 'permission-denied') {
    return 'No tienes permisos para realizar esta operación.';
  } else if (error.code === 'unavailable') {
    return 'El servicio de Firestore no está disponible temporalmente.';
  } else if (error.code === 'deadline-exceeded') {
    return 'La consulta tardó demasiado tiempo. Intenta de nuevo.';
  } else {
    return `Error de Firestore: ${error.message || 'Error desconocido'}`;
  }
}

/**
 * Función para reintentar operaciones con backoff exponencial
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        break;
      }
      
      // Backoff exponencial
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
} 