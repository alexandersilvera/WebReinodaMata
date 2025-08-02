import { db, collection, query, where, orderBy, limit, getDocs, doc, updateDoc, serverTimestamp } from '@/core/firebase/config';
import type { Timestamp } from 'firebase/firestore';

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

/**
 * Servicio para monitorear sincronizaciones y obtener métricas
 */
export class SyncMonitorService {
  
  /**
   * Obtiene métricas generales del sistema de sincronización
   */
  static async getMetrics(): Promise<SyncMetrics> {
    try {
      // Obtener total de suscriptores
      const subscribersSnapshot = await getDocs(collection(db, 'subscribers'));
      const totalSubscribers = subscribersSnapshot.size;
      
      // Contar usuarios con authUid (sincronizados desde Auth)
      const authSyncedUsers = subscribersSnapshot.docs.filter(doc => 
        doc.data().authUid
      ).length;

      // Obtener sincronizaciones fallidas
      const failedSyncsSnapshot = await getDocs(collection(db, 'failed_syncs'));
      const totalFailed = failedSyncsSnapshot.size;
      
      // Contar pendientes de retry
      const pendingRetry = failedSyncsSnapshot.docs.filter(doc => {
        const data = doc.data();
        return !data.processed && (data.retryCount || 0) < 5;
      }).length;

      // Calcular sincronizaciones exitosas (aproximado)
      const successfulSyncs = Math.max(0, authSyncedUsers - totalFailed);

      return {
        totalSubscribers,
        totalFailed,
        pendingRetry,
        successfulSyncs,
        authSyncedUsers
      };
    } catch (error) {
      console.error('Error getting sync metrics:', error);
      throw error;
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
      console.error('Error getting failed syncs:', error);
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
      console.error('Error getting recent activity:', error);
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
      console.error('Error getting trigger errors:', error);
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
      console.error('Error marking failed sync as processed:', error);
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
      console.error('Error getting source statistics:', error);
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
      console.error('Error getting failed syncs by time range:', error);
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
      console.error('Error getting performance metrics:', error);
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