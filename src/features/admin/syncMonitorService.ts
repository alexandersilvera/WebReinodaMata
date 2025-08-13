import { 
  db, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  doc, 
  updateDoc, 
  serverTimestamp,
  startAfter
} from '@/core/firebase/config';
import type { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import type { Timestamp } from 'firebase/firestore';
import { syncLogger } from './services/logger';

// Tipos para el monitoreo de sincronizaciones
export interface FailedSync {
  id: string;
  userId: string;
  email: string;
  displayName?: string;
  error: {
    message: string;
    code?: string;
    name?: string;
  };
  attempt: number;
  timestamp: Timestamp;
  processed: boolean;
  retryCount: number;
  lastRetryAt?: Timestamp;
  lastError?: string;
}

export interface SyncMetrics {
  totalSubscribers: number;
  totalFailed: number;
  pendingRetry: number;
  successfulSyncs: number;
  authSyncedUsers: number;
}

export interface RecentActivity {
  id: string;
  email: string;
  source: string;
  active: boolean;
  createdAt: Timestamp;
  authUid?: string;
  syncedAt?: Timestamp;
}

export interface TriggerError {
  id: string;
  userId: string;
  email: string;
  error: {
    message: string;
    code?: string;
    name?: string;
  };
  duration: number;
  timestamp: Timestamp;
  triggerVersion: string;
}

// Tipos para paginación cursor-based
export interface PaginatedResult<T> {
  items: T[];
  hasNextPage: boolean;
  nextCursor?: QueryDocumentSnapshot<DocumentData>;
  totalCount?: number;
}

export interface PaginationOptions {
  limit?: number;
  cursor?: QueryDocumentSnapshot<DocumentData>;
}

/**
 * Servicio para monitorear sincronizaciones y obtener métricas
 */
export class SyncMonitorService {
  
  /**
   * Obtiene métricas generales del sistema de sincronización
   */
  static async getMetrics(): Promise<SyncMetrics> {
    try {
      // Usar Promise.allSettled para obtener datos en paralelo y manejar errores parciales
      const [subscribersResult, failedSyncsResult] = await Promise.allSettled([
        getDocs(collection(db, 'subscribers')),
        getDocs(collection(db, 'failed_syncs'))
      ]);

      let totalSubscribers = 0;
      let authSyncedUsers = 0;
      
      if (subscribersResult.status === 'fulfilled') {
        const subscribersSnapshot = subscribersResult.value;
        totalSubscribers = subscribersSnapshot.size;
        
        // Contar usuarios con authUid (sincronizados desde Auth)
        authSyncedUsers = subscribersSnapshot.docs.filter(doc => 
          doc.data().authUid
        ).length;
      } else {
        syncLogger.error('Error loading subscribers for metrics', { error: subscribersResult.reason });
      }

      let totalFailed = 0;
      let pendingRetry = 0;

      if (failedSyncsResult.status === 'fulfilled') {
        const failedSyncsSnapshot = failedSyncsResult.value;
        totalFailed = failedSyncsSnapshot.size;
        
        // Contar pendientes de retry
        pendingRetry = failedSyncsSnapshot.docs.filter(doc => {
          const data = doc.data();
          return !data.processed && (data.retryCount || 0) < 5;
        }).length;
      } else {
        syncLogger.error('Error loading failed syncs for metrics', { error: failedSyncsResult.reason });
      }

      // Calcular sincronizaciones exitosas (aproximado)
      const successfulSyncs = Math.max(0, authSyncedUsers - totalFailed);

      const metrics = {
        totalSubscribers,
        totalFailed,
        pendingRetry,
        successfulSyncs,
        authSyncedUsers
      };

      syncLogger.info('Sync metrics calculated', metrics);
      return metrics;
    } catch (error) {
      syncLogger.error('Error getting sync metrics', { error });
      // Retornar métricas vacías en lugar de fallar completamente
      return {
        totalSubscribers: 0,
        totalFailed: 0,
        pendingRetry: 0,
        successfulSyncs: 0,
        authSyncedUsers: 0
      };
    }
  }

  /**
   * Obtiene las sincronizaciones fallidas más recientes
   */
  static async getFailedSyncs(maxResults: number = 20): Promise<FailedSync[]> {
    try {
      const failedSyncsQuery = query(
        collection(db, 'failed_syncs'),
        orderBy('timestamp', 'desc'),
        limit(maxResults)
      );
      
      const snapshot = await getDocs(failedSyncsQuery);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FailedSync[];
    } catch (error) {
      syncLogger.error('Error getting failed syncs', { error });
      throw error;
    }
  }

  /**
   * Obtiene sincronizaciones fallidas con paginación cursor-based
   */
  static async getFailedSyncsPaginated(
    options: PaginationOptions = {}
  ): Promise<PaginatedResult<FailedSync>> {
    try {
      const { limit: maxResults = 20, cursor } = options;
      
      let failedSyncsQuery = query(
        collection(db, 'failed_syncs'),
        orderBy('timestamp', 'desc'),
        limit(maxResults + 1) // +1 para determinar si hay más páginas
      );

      // Si hay cursor, empezar después de él
      if (cursor) {
        failedSyncsQuery = query(
          collection(db, 'failed_syncs'),
          orderBy('timestamp', 'desc'),
          startAfter(cursor),
          limit(maxResults + 1)
        );
      }
      
      const snapshot = await getDocs(failedSyncsQuery);
      const docs = snapshot.docs;
      
      // Verificar si hay más páginas
      const hasNextPage = docs.length > maxResults;
      const items = docs.slice(0, maxResults); // Remover el elemento extra
      const nextCursor = hasNextPage ? docs[maxResults - 1] : undefined;
      
      return {
        items: items.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as FailedSync[],
        hasNextPage,
        nextCursor
      };
    } catch (error) {
      syncLogger.error('Error getting paginated failed syncs', { error });
      throw error;
    }
  }

  /**
   * Obtiene la actividad reciente de sincronizaciones
   */
  static async getRecentActivity(maxResults: number = 25): Promise<RecentActivity[]> {
    try {
      const recentQuery = query(
        collection(db, 'subscribers'),
        orderBy('createdAt', 'desc'),
        limit(maxResults)
      );
      
      const snapshot = await getDocs(recentQuery);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as RecentActivity[];
    } catch (error) {
      syncLogger.error('Error getting recent activity', { error });
      throw error;
    }
  }

  /**
   * Obtiene actividad reciente con paginación cursor-based
   */
  static async getRecentActivityPaginated(
    options: PaginationOptions = {}
  ): Promise<PaginatedResult<RecentActivity>> {
    try {
      const { limit: maxResults = 25, cursor } = options;
      
      let recentQuery = query(
        collection(db, 'subscribers'),
        orderBy('createdAt', 'desc'),
        limit(maxResults + 1)
      );

      if (cursor) {
        recentQuery = query(
          collection(db, 'subscribers'),
          orderBy('createdAt', 'desc'),
          startAfter(cursor),
          limit(maxResults + 1)
        );
      }
      
      const snapshot = await getDocs(recentQuery);
      const docs = snapshot.docs;
      
      const hasNextPage = docs.length > maxResults;
      const items = docs.slice(0, maxResults);
      const nextCursor = hasNextPage ? docs[maxResults - 1] : undefined;
      
      return {
        items: items.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as RecentActivity[],
        hasNextPage,
        nextCursor
      };
    } catch (error) {
      syncLogger.error('Error getting paginated recent activity', { error });
      throw error;
    }
  }

  /**
   * Obtiene errores de triggers
   */
  static async getTriggerErrors(maxResults: number = 10): Promise<TriggerError[]> {
    try {
      const errorsQuery = query(
        collection(db, 'trigger_errors'),
        orderBy('timestamp', 'desc'),
        limit(maxResults)
      );
      
      const snapshot = await getDocs(errorsQuery);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TriggerError[];
    } catch (error) {
      syncLogger.error('Error getting trigger errors', { error });
      // No fallar si la colección no existe aún
      return [];
    }
  }

  /**
   * Marca una sincronización fallida como procesada
   */
  static async markFailedSyncAsProcessed(failedSyncId: string): Promise<void> {
    try {
      const failedSyncRef = doc(db, 'failed_syncs', failedSyncId);
      await updateDoc(failedSyncRef, {
        processed: true,
        processedAt: serverTimestamp(),
        manuallyProcessed: true
      });
    } catch (error) {
      syncLogger.error('Error marking failed sync as processed', { error });
      throw error;
    }
  }

  /**
   * Obtiene estadísticas por fuente de sincronización
   */
  static async getSourceStatistics(): Promise<Record<string, number>> {
    try {
      const subscribersSnapshot = await getDocs(collection(db, 'subscribers'));
      const sourceStats: Record<string, number> = {};
      
      subscribersSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const source = data.source || 'unknown';
        sourceStats[source] = (sourceStats[source] || 0) + 1;
      });
      
      return sourceStats;
    } catch (error) {
      syncLogger.error('Error getting source statistics', { error });
      throw error;
    }
  }

  /**
   * Obtiene sincronizaciones fallidas por período de tiempo
   */
  static async getFailedSyncsByTimeRange(days: number = 7): Promise<FailedSync[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const failedSyncsQuery = query(
        collection(db, 'failed_syncs'),
        where('timestamp', '>=', startDate),
        orderBy('timestamp', 'desc')
      );
      
      const snapshot = await getDocs(failedSyncsQuery);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FailedSync[];
    } catch (error) {
      syncLogger.error('Error getting failed syncs by time range', { error });
      throw error;
    }
  }

  /**
   * Obtiene métricas de rendimiento del sistema
   */
  static async getPerformanceMetrics(): Promise<{
    averageSyncDuration: number;
    successRate: number;
    totalProcessed: number;
    lastProcessingTime: Date | null;
  }> {
    try {
      // Estas métricas podrían venir de sync_metrics collection si la implementas
      const metrics = await getDocs(collection(db, 'sync_metrics'));
      
      if (metrics.empty) {
        return {
          averageSyncDuration: 0,
          successRate: 0,
          totalProcessed: 0,
          lastProcessingTime: null
        };
      }

      const durations: number[] = [];
      let totalSuccessful = 0;
      let lastProcessing: Date | null = null;

      metrics.docs.forEach(doc => {
        const data = doc.data();
        if (data.duration) durations.push(data.duration);
        if (data.type === 'auth_trigger_success') totalSuccessful++;
        if (data.timestamp) {
          const timestamp = data.timestamp.toDate();
          if (!lastProcessing || timestamp > lastProcessing) {
            lastProcessing = timestamp;
          }
        }
      });

      const averageDuration = durations.length > 0 
        ? durations.reduce((sum, d) => sum + d, 0) / durations.length 
        : 0;

      const successRate = metrics.size > 0 
        ? (totalSuccessful / metrics.size) * 100 
        : 0;

      return {
        averageSyncDuration: Math.round(averageDuration),
        successRate: Math.round(successRate * 100) / 100,
        totalProcessed: metrics.size,
        lastProcessingTime: lastProcessing
      };
    } catch (error) {
      syncLogger.error('Error getting performance metrics', { error });
      return {
        averageSyncDuration: 0,
        successRate: 0,
        totalProcessed: 0,
        lastProcessingTime: null
      };
    }
  }
}

// Utility functions para formateo
export const formatters = {
  /**
   * Formatea una fecha de Firestore
   */
  formatFirestoreDate(timestamp: Timestamp | Date | null | undefined): string {
    if (!timestamp) return 'Fecha no disponible';
    
    let date: Date;
    if (timestamp instanceof Date) {
      date = timestamp;
    } else if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      date = timestamp.toDate();
    } else {
      return 'Formato de fecha inválido';
    }
    
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  },

  /**
   * Formatea duración en milisegundos a texto legible
   */
  formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}min`;
  },

  /**
   * Obtiene color y etiqueta para fuentes de sincronización
   */
  getSourceInfo(source: string): { label: string; color: string } {
    const sourceMap = {
      'web': { label: 'Suscripción Web', color: 'bg-blue-600' },
      'auth_sync': { label: 'Auth Manual', color: 'bg-purple-600' },
      'auth_auto': { label: 'Auth Automático', color: 'bg-green-600' },
      'auth_trigger': { label: 'Auth Trigger', color: 'bg-indigo-600' },
      'auth_trigger_v2': { label: 'Auth Trigger v2', color: 'bg-teal-600' },
      'manual': { label: 'Manual', color: 'bg-gray-600' }
    };
    
    return sourceMap[source] || { label: 'Desconocido', color: 'bg-gray-500' };
  }
};