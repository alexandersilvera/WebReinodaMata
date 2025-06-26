import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  Query
} from 'firebase/firestore';
import type { DocumentData } from 'firebase/firestore';
import { db } from '../../core/firebase/config';
import type { Article } from '@/core/types';

const COLLECTION_NAME = 'articles';

// Obtener todos los artículos
export async function getAllArticles(includeDrafts = false): Promise<Article[]> {
  try {
    let articlesQuery: Query<DocumentData>;
    
    if (includeDrafts) {
      articlesQuery = query(
        collection(db, COLLECTION_NAME),
        orderBy('pubDate', 'desc')
      );
    } else {
      articlesQuery = query(
        collection(db, COLLECTION_NAME),
        where('draft', '==', false),
        orderBy('pubDate', 'desc')
      );
    }
    
    const snapshot = await getDocs(articlesQuery);
    return snapshot.docs.map(doc => {
      const data = doc.data() as Omit<Article, 'id'>;
      return {
        id: doc.id,
        ...data
      } as Article;
    });
  } catch (error) {
    console.error('Error al obtener artículos:', error);
    throw error;
  }
}

// Obtener artículo por slug
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const articlesQuery = query(
      collection(db, COLLECTION_NAME),
      where('slug', '==', slug)
    );
    
    const snapshot = await getDocs(articlesQuery);
    
    if (snapshot.empty) {
      return null;
    }
    
    const docSnapshot = snapshot.docs[0];
    const data = docSnapshot.data() as Omit<Article, 'id'>;
    return {
      id: docSnapshot.id,
      ...data
    } as Article;
  } catch (error) {
    console.error(`Error al obtener artículo con slug ${slug}:`, error);
    throw error;
  }
}

// Crear un nuevo artículo
export async function createArticle(articleData: Omit<Article, 'id'>): Promise<Article> {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...articleData,
      views: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    const newArticle = await getDoc(docRef);
    const data = newArticle.data() as Omit<Article, 'id'>;
    
    return {
      id: docRef.id,
      ...data
    } as Article;
  } catch (error) {
    console.error('Error al crear artículo:', error);
    throw error;
  }
}

// Actualizar un artículo
export async function updateArticle(id: string, articleData: Partial<Article>): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...articleData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error(`Error al actualizar artículo ${id}:`, error);
    throw error;
  }
}

// Eliminar un artículo
export async function deleteArticle(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error al eliminar artículo ${id}:`, error);
    throw error;
  }
}

// Incrementar contador de vistas
export async function incrementArticleViews(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const articleSnap = await getDoc(docRef);
    
    if (articleSnap.exists()) {
      const currentViews = articleSnap.data().views || 0;
      await updateDoc(docRef, { 
        views: currentViews + 1,
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error(`Error al incrementar vistas del artículo ${id}:`, error);
    // No lanzamos el error para que no afecte la visualización del artículo
  }
} 