import { db } from '../core/firebase/config';
import { 
  collection, 
  addDoc, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  Timestamp, 
  serverTimestamp,
  updateDoc 
} from 'firebase/firestore';

// Interfaces para los tipos de datos
export interface Article {
  id?: string;
  title: string;
  slug: string;
  content: string;
  description: string;
  image: string;
  author: string;
  tags: string[];
  draft: boolean;
  featured: boolean;
  commentsEnabled: boolean;
  publishDate: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Draft {
  id?: string;
  title: string;
  slug: string;
  content: string;
  description: string;
  image: string;
  author: string;
  tags: string[];
  draft: boolean;
  featured: boolean;
  commentsEnabled: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Colecciones en Firestore
const ARTICLES_COLLECTION = 'articles';
const DRAFTS_COLLECTION = 'drafts';

/**
 * Crear un nuevo artículo en Firestore
 */
export const createArticle = async (articleData: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const articlesRef = collection(db, ARTICLES_COLLECTION);
    const docRef = await addDoc(articlesRef, {
      ...articleData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error al crear artículo:', error);
    throw error;
  }
};

/**
 * Actualizar un artículo existente
 */
export const updateArticle = async (articleId: string, articleData: Partial<Article>): Promise<void> => {
  try {
    const articleRef = doc(db, ARTICLES_COLLECTION, articleId);
    await updateDoc(articleRef, {
      ...articleData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error al actualizar artículo:', error);
    throw error;
  }
};

/**
 * Eliminar un artículo
 */
export const deleteArticle = async (articleId: string): Promise<void> => {
  try {
    const articleRef = doc(db, ARTICLES_COLLECTION, articleId);
    await deleteDoc(articleRef);
  } catch (error) {
    console.error('Error al eliminar artículo:', error);
    throw error;
  }
};

/**
 * Obtener un artículo por ID
 */
export const getArticleById = async (articleId: string): Promise<Article | null> => {
  try {
    const articleRef = doc(db, ARTICLES_COLLECTION, articleId);
    const articleSnap = await getDoc(articleRef);
    
    if (articleSnap.exists()) {
      return {
        id: articleSnap.id,
        ...articleSnap.data()
      } as Article;
    }
    
    return null;
  } catch (error) {
    console.error('Error al obtener artículo:', error);
    throw error;
  }
};

/**
 * Obtener un artículo por slug
 */
export const getArticleBySlug = async (slug: string): Promise<Article | null> => {
  try {
    const articlesRef = collection(db, ARTICLES_COLLECTION);
    const q = query(articlesRef, where('slug', '==', slug), limit(1));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      } as Article;
    }
    
    return null;
  } catch (error) {
    console.error('Error al obtener artículo por slug:', error);
    throw error;
  }
};

/**
 * Obtener todos los artículos publicados
 */
export const getPublishedArticles = async (limitCount?: number): Promise<Article[]> => {
  try {
    const articlesRef = collection(db, ARTICLES_COLLECTION);
    // Simplificar consulta para evitar índices compuestos
    const q = query(
      articlesRef, 
      where('draft', '==', false)
    );
    
    const querySnapshot = await getDocs(q);
    let articles = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Article));
    
    // Ordenar en memoria por publishDate (más reciente primero)
    articles = articles.sort((a, b) => b.publishDate.toMillis() - a.publishDate.toMillis());
    
    // Aplicar límite si se especifica
    if (limitCount) {
      articles = articles.slice(0, limitCount);
    }
    
    return articles;
  } catch (error) {
    console.error('Error al obtener artículos publicados:', error);
    throw error;
  }
};

/**
 * Obtener artículos destacados
 */
export const getFeaturedArticles = async (limitCount: number = 3): Promise<Article[]> => {
  try {
    const articlesRef = collection(db, ARTICLES_COLLECTION);
    // Simplificar consulta para evitar índices compuestos
    const q = query(
      articlesRef,
      where('draft', '==', false),
      where('featured', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    let articles = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Article));
    
    // Ordenar en memoria por publishDate (más reciente primero) y aplicar límite
    articles = articles
      .sort((a, b) => b.publishDate.toMillis() - a.publishDate.toMillis())
      .slice(0, limitCount);
    
    return articles;
  } catch (error) {
    console.error('Error al obtener artículos destacados:', error);
    throw error;
  }
};

/**
 * Buscar artículos por etiqueta
 */
export const getArticlesByTag = async (tag: string): Promise<Article[]> => {
  try {
    const articlesRef = collection(db, ARTICLES_COLLECTION);
    // Simplificar consulta para evitar índices compuestos
    const q = query(
      articlesRef,
      where('draft', '==', false),
      where('tags', 'array-contains', tag)
    );
    
    const querySnapshot = await getDocs(q);
    let articles = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Article));
    
    // Ordenar en memoria por publishDate (más reciente primero)
    articles = articles.sort((a, b) => b.publishDate.toMillis() - a.publishDate.toMillis());
    
    return articles;
  } catch (error) {
    console.error('Error al buscar artículos por etiqueta:', error);
    throw error;
  }
};

/**
 * Obtener todos los artículos (incluyendo borradores) - Solo para admin
 */
export const getAllArticles = async (): Promise<Article[]> => {
  try {
    const articlesRef = collection(db, ARTICLES_COLLECTION);
    const q = query(articlesRef, orderBy('updatedAt', 'desc'));
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Article));
  } catch (error) {
    console.error('Error al obtener todos los artículos:', error);
    throw error;
  }
};

// ===== FUNCIONES PARA BORRADORES =====

/**
 * Limpiar borradores antiguos con el mismo slug (excepto el actual)
 */
export const cleanupOldDraftsWithSlug = async (slug: string, currentDraftId?: string): Promise<void> => {
  try {
    console.log('[CLEANUP_DRAFTS] Limpiando borradores antiguos con slug:', slug, 'excepto:', currentDraftId);
    
    const draftsRef = collection(db, DRAFTS_COLLECTION);
    const q = query(draftsRef, where('slug', '==', slug));
    const querySnapshot = await getDocs(q);
    
    const draftsToDelete = querySnapshot.docs.filter(doc => doc.id !== currentDraftId);
    console.log('[CLEANUP_DRAFTS] Borradores a eliminar:', draftsToDelete.length);
    
    // Eliminar borradores antiguos
    const deletePromises = draftsToDelete.map(doc => {
      console.log('[CLEANUP_DRAFTS] Eliminando borrador:', doc.id);
      return deleteDoc(doc.ref);
    });
    
    await Promise.all(deletePromises);
    console.log('[CLEANUP_DRAFTS] Limpieza completada');
  } catch (error) {
    console.error('Error al limpiar borradores antiguos:', error);
    // No lanzar error para no interrumpir el flujo principal
  }
};

/**
 * Guardar un borrador
 */
export const saveDraft = async (draftData: Omit<Draft, 'id' | 'createdAt' | 'updatedAt'>, draftId?: string): Promise<string> => {
  try {
    let resultDraftId: string;
    
    if (draftId) {
      // Actualizar borrador existente
      const draftRef = doc(db, DRAFTS_COLLECTION, draftId);
      await setDoc(draftRef, {
        ...draftData,
        updatedAt: serverTimestamp()
      }, { merge: true });
      resultDraftId = draftId;
    } else {
      // Crear nuevo borrador
      const draftsRef = collection(db, DRAFTS_COLLECTION);
      const docRef = await addDoc(draftsRef, {
        ...draftData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      resultDraftId = docRef.id;
    }
    
    // Limpiar borradores antiguos con el mismo slug
    if (draftData.slug) {
      await cleanupOldDraftsWithSlug(draftData.slug, resultDraftId);
    }
    
    return resultDraftId;
  } catch (error) {
    console.error('Error al guardar borrador:', error);
    throw error;
  }
};

/**
 * Obtener un borrador por ID
 */
export const getDraftById = async (draftId: string): Promise<Draft | null> => {
  try {
    const draftRef = doc(db, DRAFTS_COLLECTION, draftId);
    const draftSnap = await getDoc(draftRef);
    
    if (draftSnap.exists()) {
      return {
        id: draftSnap.id,
        ...draftSnap.data()
      } as Draft;
    }
    
    return null;
  } catch (error) {
    console.error('Error al obtener borrador:', error);
    throw error;
  }
};

/**
 * Obtener todos los borradores
 */
export const getAllDrafts = async (): Promise<Draft[]> => {
  try {
    const draftsRef = collection(db, DRAFTS_COLLECTION);
    const q = query(draftsRef, orderBy('updatedAt', 'desc'));
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Draft));
  } catch (error) {
    console.error('Error al obtener borradores:', error);
    throw error;
  }
};

/**
 * Eliminar un borrador
 */
export const deleteDraft = async (draftId: string): Promise<void> => {
  try {
    const draftRef = doc(db, DRAFTS_COLLECTION, draftId);
    await deleteDoc(draftRef);
  } catch (error) {
    console.error('Error al eliminar borrador:', error);
    throw error;
  }
};

/**
 * Convertir un borrador en artículo publicado
 */
export const publishDraftAsArticle = async (draftId: string): Promise<string> => {
  try {
    // Obtener el borrador
    const draft = await getDraftById(draftId);
    if (!draft) {
      throw new Error('Borrador no encontrado');
    }
    
    // Crear el artículo
    const articleData = {
      ...draft,
      draft: false,
      publishDate: Timestamp.fromDate(new Date())
    };
    
    delete articleData.id; // Remover el ID del borrador
    
    const articleId = await createArticle(articleData);
    
    // Eliminar el borrador
    await deleteDraft(draftId);
    
    return articleId;
  } catch (error) {
    console.error('Error al publicar borrador:', error);
    throw error;
  }
};

/**
 * Verificar si un slug ya existe
 */
export const checkSlugExists = async (slug: string, excludeId?: string): Promise<boolean> => {
  try {
    console.log('[CHECK_SLUG_EXISTS] Verificando slug:', slug, 'excludeId:', excludeId);
    
    // Verificar en artículos
    const articlesRef = collection(db, ARTICLES_COLLECTION);
    const articlesQuery = query(articlesRef, where('slug', '==', slug));
    
    const articlesSnapshot = await getDocs(articlesQuery);
    console.log('[CHECK_SLUG_EXISTS] Artículos encontrados:', articlesSnapshot.docs.length);
    
    articlesSnapshot.docs.forEach(doc => {
      console.log('[CHECK_SLUG_EXISTS] Artículo:', doc.id, 'slug:', doc.data().slug);
    });
    
    const existsInArticles = articlesSnapshot.docs.some(doc => doc.id !== excludeId);
    console.log('[CHECK_SLUG_EXISTS] Existe en artículos (después de excluir):', existsInArticles);
    
    if (existsInArticles) return true;
    
    // Verificar en borradores
    const draftsRef = collection(db, DRAFTS_COLLECTION);
    const draftsQuery = query(draftsRef, where('slug', '==', slug));
    
    const draftsSnapshot = await getDocs(draftsQuery);
    console.log('[CHECK_SLUG_EXISTS] Borradores encontrados:', draftsSnapshot.docs.length);
    
    draftsSnapshot.docs.forEach(doc => {
      console.log('[CHECK_SLUG_EXISTS] Borrador:', doc.id, 'slug:', doc.data().slug, 'excluido?:', doc.id === excludeId);
    });
    
    const existsInDrafts = draftsSnapshot.docs.some(doc => doc.id !== excludeId);
    console.log('[CHECK_SLUG_EXISTS] Existe en borradores (después de excluir):', existsInDrafts);
    
    return existsInDrafts;
  } catch (error) {
    console.error('Error al verificar slug:', error);
    throw error;
  }
}; 