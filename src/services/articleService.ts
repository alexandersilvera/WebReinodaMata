/**
 * Servicio Unificado de Artículos - Reino Da Mata
 * Consolida funcionalidades de firebase/articles.ts y features/blog/articleService.ts
 * Elimina duplicación y inconsistencias
 */

import { db } from '@/core/firebase/config';
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
  updateDoc,
  Query,
  type DocumentData
} from 'firebase/firestore';

// ================================================================
// TIPOS UNIFICADOS Y CONSOLIDADOS
// ================================================================

export interface Article {
  id?: string;
  title: string;
  slug: string;
  content: string;
  description: string;
  image: string;
  heroImage?: string; // Alias para compatibilidad
  author: string;
  tags: string[];
  draft: boolean;
  featured: boolean;
  commentsEnabled: boolean;
  views: number;
  publishDate: Timestamp;
  pubDate?: string; // Para compatibilidad con frontend
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
  views?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ArticleCreateData extends Omit<Article, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'pubDate' | 'heroImage'> {
  // Intentionally empty - uses Article properties minus omitted ones
}
export interface ArticleUpdateData extends Partial<Omit<Article, 'id' | 'createdAt' | 'pubDate' | 'heroImage'>> {
  // Intentionally empty - uses partial Article properties minus omitted ones
}
export interface DraftCreateData extends Omit<Draft, 'id' | 'createdAt' | 'updatedAt' | 'views'> {
  // Intentionally empty - uses Draft properties minus omitted ones
}

// ================================================================
// CONFIGURACIÓN
// ================================================================

const ARTICLES_COLLECTION = 'articles';
const DRAFTS_COLLECTION = 'drafts';

// ================================================================
// OPERACIONES DE ARTÍCULOS
// ================================================================

/**
 * Crear un nuevo artículo en Firestore
 */
export const createArticle = async (articleData: ArticleCreateData): Promise<string> => {
  try {
    const articlesRef = collection(db, ARTICLES_COLLECTION);
    const docRef = await addDoc(articlesRef, {
      ...articleData,
      views: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log('[ArticleService] Artículo creado:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('[ArticleService] Error al crear artículo:', error);
    throw error;
  }
};

/**
 * Actualizar un artículo existente
 */
export const updateArticle = async (articleId: string, articleData: ArticleUpdateData): Promise<void> => {
  try {
    const articleRef = doc(db, ARTICLES_COLLECTION, articleId);
    await updateDoc(articleRef, {
      ...articleData,
      updatedAt: serverTimestamp()
    });
    
    console.log('[ArticleService] Artículo actualizado:', articleId);
  } catch (error) {
    console.error('[ArticleService] Error al actualizar artículo:', error);
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
    
    console.log('[ArticleService] Artículo eliminado:', articleId);
  } catch (error) {
    console.error('[ArticleService] Error al eliminar artículo:', error);
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
      const data = articleSnap.data();
      return normalizeArticle({
        id: articleSnap.id,
        ...data
      } as Article);
    }
    
    return null;
  } catch (error) {
    console.error('[ArticleService] Error al obtener artículo:', error);
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
      const data = doc.data();
      return normalizeArticle({
        id: doc.id,
        ...data
      } as Article);
    }
    
    return null;
  } catch (error) {
    console.error('[ArticleService] Error al obtener artículo por slug:', error);
    throw error;
  }
};

/**
 * Obtener todos los artículos (con filtros opcionales)
 */
export const getAllArticles = async (options: {
  includeDrafts?: boolean;
  limitCount?: number;
  onlyFeatured?: boolean;
  orderByField?: 'publishDate' | 'createdAt' | 'updatedAt';
} = {}): Promise<Article[]> => {
  try {
    const { 
      includeDrafts = false, 
      limitCount, 
      onlyFeatured = false,
      orderByField = 'publishDate'
    } = options;

    const articlesRef = collection(db, ARTICLES_COLLECTION);
    let q: Query<DocumentData> = articlesRef;

    // Usar consulta simple sin índices compuestos
    q = query(articlesRef, orderBy(orderByField, 'desc'));
    
    if (limitCount && (includeDrafts && !onlyFeatured)) {
      // Solo aplicar limit si no necesitamos filtrar después
      q = query(q, limit(limitCount * 2)); // Obtener más para compensar filtros
    }

    const querySnapshot = await getDocs(q);
    let articles = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return normalizeArticle({
        id: doc.id,
        ...data
      } as Article);
    });

    // Aplicar filtros en memoria (más simple que índices compuestos)
    if (!includeDrafts) {
      articles = articles.filter(article => !article.draft);
    }
    if (onlyFeatured) {
      articles = articles.filter(article => article.featured);
    }

    // Aplicar limit después del filtrado
    if (limitCount) {
      articles = articles.slice(0, limitCount);
    }

    console.log(`[ArticleService] Obtenidos ${articles.length} artículos`);
    return articles;
  } catch (error) {
    console.error('[ArticleService] Error al obtener todos los artículos:', error);
    throw error;
  }
};

/**
 * Obtener artículos publicados (solo los visibles públicamente)
 */
export const getPublishedArticles = async (limitCount?: number): Promise<Article[]> => {
  return getAllArticles({ 
    includeDrafts: false, 
    limitCount,
    orderByField: 'publishDate'
  });
};

/**
 * Obtener artículos destacados
 */
export const getFeaturedArticles = async (limitCount: number = 3): Promise<Article[]> => {
  return getAllArticles({ 
    includeDrafts: false, 
    onlyFeatured: true, 
    limitCount,
    orderByField: 'publishDate'
  });
};

/**
 * Buscar artículos por etiqueta
 */
export const getArticlesByTag = async (tag: string): Promise<Article[]> => {
  try {
    const articlesRef = collection(db, ARTICLES_COLLECTION);
    // Usar consulta simple solo por tags, luego filtrar en memoria
    const q = query(
      articlesRef,
      where('tags', 'array-contains', tag)
    );
    
    const querySnapshot = await getDocs(q);
    let articles = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return normalizeArticle({
        id: doc.id,
        ...data
      } as Article);
    });
    
    // Filtrar borradores y ordenar en memoria
    articles = articles
      .filter(article => !article.draft)
      .sort((a, b) => {
        const aDate = a.publishDate?.toDate?.() || new Date(a.publishDate as unknown as string | number | Date);
        const bDate = b.publishDate?.toDate?.() || new Date(b.publishDate as unknown as string | number | Date);
        return bDate.getTime() - aDate.getTime();
      });
    
    console.log(`[ArticleService] Encontrados ${articles.length} artículos con tag:`, tag);
    return articles;
  } catch (error) {
    console.error('[ArticleService] Error al buscar artículos por etiqueta:', error);
    throw error;
  }
};

/**
 * Incrementar contador de vistas
 */
export const incrementArticleViews = async (articleId: string): Promise<void> => {
  try {
    const articleRef = doc(db, ARTICLES_COLLECTION, articleId);
    const articleSnap = await getDoc(articleRef);
    
    if (articleSnap.exists()) {
      const currentViews = articleSnap.data().views || 0;
      await updateDoc(articleRef, { 
        views: currentViews + 1,
        updatedAt: serverTimestamp()
      });
      
      console.log(`[ArticleService] Vistas incrementadas para artículo ${articleId}: ${currentViews + 1}`);
    }
  } catch (error) {
    console.error('[ArticleService] Error al incrementar vistas:', error);
    // No lanzar error para que no afecte la visualización del artículo
  }
};

// ================================================================
// OPERACIONES DE BORRADORES
// ================================================================

/**
 * Limpiar borradores antiguos con el mismo slug (excepto el actual)
 */
export const cleanupOldDraftsWithSlug = async (slug: string, currentDraftId?: string): Promise<void> => {
  try {
    console.log('[ArticleService] Limpiando borradores antiguos con slug:', slug, 'excepto:', currentDraftId);
    
    const draftsRef = collection(db, DRAFTS_COLLECTION);
    const q = query(draftsRef, where('slug', '==', slug));
    const querySnapshot = await getDocs(q);
    
    const draftsToDelete = querySnapshot.docs.filter(doc => doc.id !== currentDraftId);
    console.log('[ArticleService] Borradores a eliminar:', draftsToDelete.length);
    
    const deletePromises = draftsToDelete.map(doc => {
      console.log('[ArticleService] Eliminando borrador:', doc.id);
      return deleteDoc(doc.ref);
    });
    
    await Promise.all(deletePromises);
    console.log('[ArticleService] Limpieza de borradores completada');
  } catch (error) {
    console.error('[ArticleService] Error al limpiar borradores antiguos:', error);
    // No lanzar error para no interrumpir el flujo principal
  }
};

/**
 * Guardar un borrador
 */
export const saveDraft = async (draftData: DraftCreateData, draftId?: string): Promise<string> => {
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
      console.log('[ArticleService] Borrador actualizado:', draftId);
    } else {
      // Crear nuevo borrador
      const draftsRef = collection(db, DRAFTS_COLLECTION);
      const docRef = await addDoc(draftsRef, {
        ...draftData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      resultDraftId = docRef.id;
      console.log('[ArticleService] Borrador creado:', resultDraftId);
    }
    
    // Limpiar borradores antiguos con el mismo slug
    if (draftData.slug) {
      await cleanupOldDraftsWithSlug(draftData.slug, resultDraftId);
    }
    
    return resultDraftId;
  } catch (error) {
    console.error('[ArticleService] Error al guardar borrador:', error);
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
    console.error('[ArticleService] Error al obtener borrador:', error);
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
    const drafts = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Draft));
    
    console.log(`[ArticleService] Obtenidos ${drafts.length} borradores`);
    return drafts;
  } catch (error) {
    console.error('[ArticleService] Error al obtener borradores:', error);
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
    
    console.log('[ArticleService] Borrador eliminado:', draftId);
  } catch (error) {
    console.error('[ArticleService] Error al eliminar borrador:', error);
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
    const articleData: ArticleCreateData = {
      ...draft,
      draft: false,
      publishDate: Timestamp.fromDate(new Date())
    };
    
    // Remover campos específicos del borrador
    delete (articleData as Record<string, unknown>).id;
    
    const articleId = await createArticle(articleData);
    
    // Eliminar el borrador
    await deleteDraft(draftId);
    
    console.log('[ArticleService] Borrador publicado como artículo:', articleId);
    return articleId;
  } catch (error) {
    console.error('[ArticleService] Error al publicar borrador:', error);
    throw error;
  }
};

// ================================================================
// UTILIDADES Y VALIDACIONES
// ================================================================

/**
 * Verificar si un slug ya existe
 */
export const checkSlugExists = async (slug: string, excludeId?: string): Promise<boolean> => {
  try {
    console.log('[ArticleService] Verificando slug:', slug, 'excludeId:', excludeId);
    
    // Verificar en artículos
    const articlesRef = collection(db, ARTICLES_COLLECTION);
    const articlesQuery = query(articlesRef, where('slug', '==', slug));
    const articlesSnapshot = await getDocs(articlesQuery);
    
    const existsInArticles = articlesSnapshot.docs.some(doc => doc.id !== excludeId);
    if (existsInArticles) return true;
    
    // Verificar en borradores
    const draftsRef = collection(db, DRAFTS_COLLECTION);
    const draftsQuery = query(draftsRef, where('slug', '==', slug));
    const draftsSnapshot = await getDocs(draftsQuery);
    
    const existsInDrafts = draftsSnapshot.docs.some(doc => doc.id !== excludeId);
    return existsInDrafts;
  } catch (error) {
    console.error('[ArticleService] Error al verificar slug:', error);
    throw error;
  }
};

/**
 * Normalizar artículo para compatibilidad entre formatos
 */
function normalizeArticle(article: Article): Article {
  // Asegurar compatibilidad entre campos
  if (article.image && !article.heroImage) {
    article.heroImage = article.image;
  }
  
  if (article.publishDate && !article.pubDate) {
    article.pubDate = article.publishDate.toDate().toISOString();
  }
  
  // Asegurar que views existe
  if (typeof article.views !== 'number') {
    article.views = 0;
  }
  
  return article;
}

// ================================================================
// EXPORTACIONES DE COMPATIBILIDAD (para migración gradual)
// ================================================================

// Aliases para mantener compatibilidad durante la migración
export { 
  getAllArticles as getPublishedArticles_legacy,
  getArticleBySlug as getArticleBySlug_legacy,
  createArticle as createArticle_legacy,
  updateArticle as updateArticle_legacy,
  deleteArticle as deleteArticle_legacy,
  incrementArticleViews as incrementArticleViews_legacy
};

export default {
  // Artículos
  createArticle,
  updateArticle,
  deleteArticle,
  getArticleById,
  getArticleBySlug,
  getAllArticles,
  getPublishedArticles,
  getFeaturedArticles,
  getArticlesByTag,
  incrementArticleViews,
  
  // Borradores
  saveDraft,
  getDraftById,
  getAllDrafts,
  deleteDraft,
  publishDraftAsArticle,
  cleanupOldDraftsWithSlug,
  
  // Utilidades
  checkSlugExists
};