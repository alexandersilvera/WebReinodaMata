/**
 * Cliente de React Query optimizado para el panel administrativo
 * Configurado con cacheo inteligente y manejo de errores
 */

import { QueryClient } from '@tanstack/react-query';

// Función para determinar si un error es de autorización
const isUnauthorizedError = (error: unknown): boolean => {
  if (error && typeof error === 'object' && 'code' in error) {
    return (error as { code: string }).code === 'permission-denied' ||
           (error as { code: string }).code === 'unauthenticated';
  }
  return false;
};

// Cliente de React Query configurado para admin
export const adminQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache por 5 minutos para datos administrativos
      staleTime: 5 * 60 * 1000,
      // Mantener en cache por 10 minutos
      gcTime: 10 * 60 * 1000,
      // No refetch al cambiar de ventana para mejor UX
      refetchOnWindowFocus: false,
      // No refetch al reconectar automáticamente
      refetchOnReconnect: 'always',
      // Retry inteligente
      retry: (failureCount, error) => {
        // No reintentar errores de autorización
        if (isUnauthorizedError(error)) return false;
        // Máximo 3 reintentos para otros errores
        return failureCount < 3;
      },
      // Delay exponencial para reintentos
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // Retry para mutaciones críticas
      retry: (failureCount, error) => {
        if (isUnauthorizedError(error)) return false;
        return failureCount < 2;
      },
    },
  },
});

// Keys de queries organizadas por categoría
export const adminQueryKeys = {
  all: ['admin'] as const,
  
  // Métricas y estadísticas
  metrics: () => [...adminQueryKeys.all, 'metrics'] as const,
  syncMetrics: () => [...adminQueryKeys.metrics(), 'sync'] as const,
  performanceMetrics: () => [...adminQueryKeys.metrics(), 'performance'] as const,
  sourceStats: () => [...adminQueryKeys.metrics(), 'sources'] as const,
  
  // Sincronizaciones
  syncs: () => [...adminQueryKeys.all, 'syncs'] as const,
  failedSyncs: (limit?: number) => [...adminQueryKeys.syncs(), 'failed', { limit }] as const,
  recentActivity: (limit?: number) => [...adminQueryKeys.syncs(), 'activity', { limit }] as const,
  triggerErrors: (limit?: number) => [...adminQueryKeys.syncs(), 'errors', { limit }] as const,
  
  // Configuración
  config: () => [...adminQueryKeys.all, 'config'] as const,
  adminConfig: () => [...adminQueryKeys.config(), 'admin'] as const,
  siteSettings: () => [...adminQueryKeys.config(), 'site'] as const,
  
  // Suscriptores
  subscribers: () => [...adminQueryKeys.all, 'subscribers'] as const,
  subscribersList: (filters?: any) => [...adminQueryKeys.subscribers(), 'list', filters] as const,
  subscriberStats: () => [...adminQueryKeys.subscribers(), 'stats'] as const,
};

// Utilidades para invalidación de cache
export const adminCacheUtils = {
  /**
   * Invalida todas las métricas
   */
  invalidateMetrics: () => {
    return adminQueryClient.invalidateQueries({
      queryKey: adminQueryKeys.metrics()
    });
  },

  /**
   * Invalida datos de sincronización
   */
  invalidateSyncs: () => {
    return adminQueryClient.invalidateQueries({
      queryKey: adminQueryKeys.syncs()
    });
  },

  /**
   * Invalida configuración
   */
  invalidateConfig: () => {
    return adminQueryClient.invalidateQueries({
      queryKey: adminQueryKeys.config()
    });
  },

  /**
   * Invalida datos de suscriptores
   */
  invalidateSubscribers: () => {
    return adminQueryClient.invalidateQueries({
      queryKey: adminQueryKeys.subscribers()
    });
  },

  /**
   * Limpia toda la cache administrativa
   */
  clearAdminCache: () => {
    return adminQueryClient.invalidateQueries({
      queryKey: adminQueryKeys.all
    });
  },

  /**
   * Prefetch de datos críticos
   */
  prefetchCriticalData: async () => {
    const prefetchPromises = [
      adminQueryClient.prefetchQuery({
        queryKey: adminQueryKeys.syncMetrics(),
        staleTime: 2 * 60 * 1000, // 2 minutos para datos críticos
      }),
      adminQueryClient.prefetchQuery({
        queryKey: adminQueryKeys.adminConfig(),
        staleTime: 10 * 60 * 1000, // 10 minutos para config
      })
    ];

    await Promise.allSettled(prefetchPromises);
  }
};

// Hook para usar el cliente en componentes
export const useAdminQueryClient = () => adminQueryClient;