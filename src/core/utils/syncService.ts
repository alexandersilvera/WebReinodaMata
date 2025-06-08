import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/config';
import type { Article } from '../types';

/**
 * Servicio para sincronización entre Firestore y archivos Markdown
 */

// Interfaces para las respuestas
export interface SyncResponse {
  message: string;
  articleCount: number;
  syncedArticles: string[];
  errors?: string[];
}

export interface MigrationResponse {
  message: string;
  articleCount: number;
  migratedArticles: Pick<Article, 'id' | 'title' | 'slug'>[];
  errors?: string[];
}

// Funciones Cloud
const syncContentToFiles = httpsCallable<void, SyncResponse>(functions, 'syncContentToFiles');
const migrateMarkdownToFirestore = httpsCallable<void, MigrationResponse>(functions, 'migrateMarkdownToFirestore');

/**
 * Sincroniza el contenido de Firestore a archivos Markdown
 * @returns Resultado de la sincronización
 */
export async function syncToMarkdown(): Promise<SyncResponse> {
  try {
    const result = await syncContentToFiles();
    return result.data;
  } catch (error: any) {
    console.error('Error al sincronizar contenido a archivos:', error);
    throw new Error(error.message || 'Error desconocido en la sincronización');
  }
}

/**
 * Migra los archivos Markdown a Firestore (operación única)
 * @returns Resultado de la migración
 */
export async function migrateToFirestore(): Promise<MigrationResponse> {
  try {
    const result = await migrateMarkdownToFirestore();
    return result.data;
  } catch (error: any) {
    console.error('Error al migrar archivos a Firestore:', error);
    throw new Error(error.message || 'Error desconocido en la migración');
  }
}

module.exports = {
  syncToMarkdown,
  migrateToFirestore
}; 