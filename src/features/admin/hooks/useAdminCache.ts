/**
 * Hooks para gestión de cache administrativo
 * Proporciona acceso optimizado a datos administrativos con caching inteligente
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminQueryKeys, adminCacheUtils } from '../services/queryClient';
import { SyncMonitorService } from '../syncMonitorService';
import { getAdminConfig, updateAdminConfig } from '../configService';
import { loadSettings, saveSettings } from '../settingsService';
import type { SyncMetrics, FailedSync, RecentActivity, TriggerError } from '../syncMonitorService';
import type { AdminConfig } from '../configService';
import type { SiteSettings } from '../settingsService';

// ===== HOOKS PARA MÉTRICAS =====

export const useSyncMetrics = () => {
  return useQuery({
    queryKey: adminQueryKeys.syncMetrics(),
    queryFn: () => SyncMonitorService.getMetrics(),
    staleTime: 2 * 60 * 1000, // 2 minutos - datos críticos
    refetchInterval: 5 * 60 * 1000, // Auto-refresh cada 5 minutos
  });
};

export const usePerformanceMetrics = () => {
  return useQuery({
    queryKey: adminQueryKeys.performanceMetrics(),
    queryFn: () => SyncMonitorService.getPerformanceMetrics(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

export const useSourceStatistics = () => {
  return useQuery({
    queryKey: adminQueryKeys.sourceStats(),
    queryFn: () => SyncMonitorService.getSourceStatistics(),
    staleTime: 10 * 60 * 1000, // 10 minutos - datos menos críticos
  });
};

// ===== HOOKS PARA SINCRONIZACIONES =====

export const useFailedSyncs = (limit: number = 20) => {
  return useQuery({
    queryKey: adminQueryKeys.failedSyncs(limit),
    queryFn: () => SyncMonitorService.getFailedSyncs(limit),
    staleTime: 3 * 60 * 1000, // 3 minutos
  });
};

export const useRecentActivity = (limit: number = 25) => {
  return useQuery({
    queryKey: adminQueryKeys.recentActivity(limit),
    queryFn: () => SyncMonitorService.getRecentActivity(limit),
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchInterval: 3 * 60 * 1000, // Auto-refresh cada 3 minutos
  });
};

export const useTriggerErrors = (limit: number = 10) => {
  return useQuery({
    queryKey: adminQueryKeys.triggerErrors(limit),
    queryFn: () => SyncMonitorService.getTriggerErrors(limit),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

export const useFailedSyncsByTimeRange = (days: number = 7) => {
  return useQuery({
    queryKey: [...adminQueryKeys.syncs(), 'failed-range', { days }],
    queryFn: () => SyncMonitorService.getFailedSyncsByTimeRange(days),
    staleTime: 10 * 60 * 1000, // 10 minutos - datos históricos
  });
};

// ===== HOOKS PARA CONFIGURACIÓN =====

export const useAdminConfig = () => {
  return useQuery({
    queryKey: adminQueryKeys.adminConfig(),
    queryFn: () => getAdminConfig(),
    staleTime: 15 * 60 * 1000, // 15 minutos - configuración cambia poco
  });
};

export const useSiteSettings = () => {
  return useQuery({
    queryKey: adminQueryKeys.siteSettings(),
    queryFn: () => loadSettings(),
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};

// ===== MUTATIONS =====

export const useMarkFailedSyncAsProcessed = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (failedSyncId: string) => 
      SyncMonitorService.markFailedSyncAsProcessed(failedSyncId),
    onSuccess: () => {
      // Invalida las queries relacionadas con syncs fallidos
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.syncs()
      });
      // También actualiza las métricas
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.syncMetrics()
      });
    },
  });
};

export const useUpdateAdminConfig = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ emails, updatedBy }: { emails: string[]; updatedBy: string }) =>
      updateAdminConfig(emails, updatedBy),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.adminConfig()
      });
    },
  });
};

export const useUpdateSiteSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (settings: Partial<SiteSettings>) => saveSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.siteSettings()
      });
    },
  });
};

// ===== HOOKS COMPUESTOS =====

/**
 * Hook que combina métricas principales para el dashboard
 */
export const useDashboardData = () => {
  const syncMetrics = useSyncMetrics();
  const performanceMetrics = usePerformanceMetrics();
  const recentActivity = useRecentActivity(10); // Solo las 10 más recientes para dashboard
  const failedSyncs = useFailedSyncs(5); // Solo las 5 más recientes para dashboard

  return {
    syncMetrics,
    performanceMetrics,
    recentActivity,
    failedSyncs,
    isLoading: syncMetrics.isLoading || performanceMetrics.isLoading,
    isError: syncMetrics.isError || performanceMetrics.isError,
    error: syncMetrics.error || performanceMetrics.error,
  };
};

/**
 * Hook para configuración completa (admin + site)
 */
export const useAdminConfiguration = () => {
  const adminConfig = useAdminConfig();
  const siteSettings = useSiteSettings();

  return {
    adminConfig,
    siteSettings,
    isLoading: adminConfig.isLoading || siteSettings.isLoading,
    isError: adminConfig.isError || siteSettings.isError,
    error: adminConfig.error || siteSettings.error,
  };
};

// ===== HOOKS DE UTILIDAD =====

/**
 * Hook para prefetch de datos críticos
 */
export const usePrefetchAdminData = () => {
  return {
    prefetchCriticalData: adminCacheUtils.prefetchCriticalData,
    invalidateAll: adminCacheUtils.clearAdminCache,
    invalidateMetrics: adminCacheUtils.invalidateMetrics,
    invalidateSyncs: adminCacheUtils.invalidateSyncs,
  };
};

/**
 * Hook para obtener el estado de carga global del admin
 */
export const useAdminLoadingState = () => {
  const queryClient = useQueryClient();
  
  // Verifica si hay queries de admin cargando
  const queries = queryClient.getQueryCache().findAll({
    queryKey: adminQueryKeys.all,
  });
  
  const isLoading = queries.some(query => query.state.fetchStatus === 'fetching');
  const hasErrors = queries.some(query => query.state.status === 'error');
  
  return {
    isLoading,
    hasErrors,
    activeQueries: queries.length,
  };
};