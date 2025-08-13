/**
 * Widget de sincronizaciones fallidas para el dashboard
 * Muestra errores recientes y permite acciones rápidas
 */

import React from 'react';
import { useFailedSyncs, useMarkFailedSyncAsProcessed } from '../hooks/useAdminCache';
import { AdminCard } from './ui';
import { formatters } from '../syncMonitorService';

export const FailedSyncsWidget: React.FC = React.memo(() => {
  const { data: failedSyncs, isLoading, error } = useFailedSyncs(5); // Solo 5 para el widget
  const markAsProcessedMutation = useMarkFailedSyncAsProcessed();

  const handleMarkAsProcessed = (syncId: string) => {
    markAsProcessedMutation.mutate(syncId);
  };

  if (error) {
    return (
      <AdminCard title="Sincronizaciones Fallidas">
        <div className="text-red-400 text-center py-4">
          Error al cargar datos
        </div>
      </AdminCard>
    );
  }

  const pendingSyncs = failedSyncs?.filter(sync => !sync.processed) || [];

  return (
    <AdminCard 
      title="Sincronizaciones Fallidas" 
      isLoading={isLoading}
      action={
        pendingSyncs.length > 0 && (
          <span className="text-red-400 text-sm">
            {pendingSyncs.length} pendientes
          </span>
        )
      }
    >
      <div className="space-y-3">
        {pendingSyncs.length > 0 ? (
          pendingSyncs.map((sync) => (
            <div
              key={sync.id}
              className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {sync.email}
                  </p>
                  <p className="text-red-300 text-xs mt-1 truncate">
                    {sync.error.message}
                  </p>
                </div>
                
                <button
                  onClick={() => handleMarkAsProcessed(sync.id)}
                  disabled={markAsProcessedMutation.isPending}
                  className="ml-2 px-2 py-1 text-xs bg-red-600 hover:bg-red-500 disabled:bg-gray-600 text-white rounded transition-colors"
                  title="Marcar como procesado"
                >
                  {markAsProcessedMutation.isPending ? '...' : '✓'}
                </button>
              </div>
              
              <div className="flex justify-between items-center text-xs text-gray-400">
                <span>Intentos: {sync.retryCount || 0}/5</span>
                <span>{formatters.formatFirestoreDate(sync.timestamp)}</span>
              </div>
            </div>
          ))
        ) : failedSyncs && failedSyncs.length === 0 ? (
          <div className="text-center py-8 text-green-400">
            <div className="text-2xl mb-2">✅</div>
            <p>Sin errores de sincronización</p>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p>Cargando errores...</p>
          </div>
        )}
      </div>
      
      {failedSyncs && failedSyncs.length > 0 && (
        <div className="mt-4 pt-3 border-t border-green-800/50">
          <a
            href="/admin/sync-monitor"
            className="text-green-400 hover:text-green-300 text-sm font-medium flex items-center justify-center gap-1"
          >
            Ver monitor completo
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      )}
    </AdminCard>
  );
});

FailedSyncsWidget.displayName = 'FailedSyncsWidget';