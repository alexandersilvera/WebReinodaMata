/**
 * Componente de resumen de métricas para el dashboard administrativo
 * Muestra estadísticas clave de sincronización y performance
 */

import React from 'react';
import { useSyncMetrics, usePerformanceMetrics } from '../hooks/useAdminCache';
import { AdminCard, LoadingSpinner } from './ui';
import { formatters } from '../syncMonitorService';

interface MetricItemProps {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'green' | 'red' | 'yellow' | 'blue';
}

const MetricItem: React.FC<MetricItemProps> = React.memo(({ 
  label, 
  value, 
  trend = 'neutral', 
  color = 'green' 
}) => {
  const colorClasses = {
    green: 'text-green-400',
    red: 'text-red-400',
    yellow: 'text-yellow-400',
    blue: 'text-blue-400'
  };

  const trendIcons = {
    up: '↗️',
    down: '↘️',
    neutral: '➡️'
  };

  return (
    <div className="bg-green-800/20 p-4 rounded-lg">
      <div className="flex justify-between items-start mb-2">
        <p className="text-gray-300 text-sm">{label}</p>
        <span className="text-xs">{trendIcons[trend]}</span>
      </div>
      <p className={`text-2xl font-bold ${colorClasses[color]}`}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
    </div>
  );
});

MetricItem.displayName = 'MetricItem';

export const MetricsOverview: React.FC = React.memo(() => {
  const { data: syncMetrics, isLoading: syncLoading, error: syncError } = useSyncMetrics();
  const { data: perfMetrics, isLoading: perfLoading } = usePerformanceMetrics();

  const isLoading = syncLoading || perfLoading;

  if (syncError) {
    return (
      <AdminCard title="Métricas del Sistema" span={2}>
        <div className="text-red-400 text-center py-8">
          Error al cargar métricas: {syncError.message}
        </div>
      </AdminCard>
    );
  }

  return (
    <AdminCard title="Métricas del Sistema" span={2} isLoading={isLoading}>
      {syncMetrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <MetricItem
            label="Total Suscriptores"
            value={syncMetrics.totalSubscribers}
            color="blue"
          />
          <MetricItem
            label="Sincronizados"
            value={syncMetrics.authSyncedUsers}
            color="green"
            trend="up"
          />
          <MetricItem
            label="Sincr. Exitosas"
            value={syncMetrics.successfulSyncs}
            color="green"
          />
          <MetricItem
            label="Fallos"
            value={syncMetrics.totalFailed}
            color={syncMetrics.totalFailed > 0 ? 'red' : 'green'}
            trend={syncMetrics.totalFailed > 0 ? 'down' : 'neutral'}
          />
        </div>
      )}

      {perfMetrics && (
        <div className="border-t border-green-800/50 pt-4">
          <h4 className="text-white font-medium mb-3">Performance</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricItem
              label="Duración Promedio"
              value={formatters.formatDuration(perfMetrics.averageSyncDuration)}
              color="yellow"
            />
            <MetricItem
              label="Tasa de Éxito"
              value={`${perfMetrics.successRate}%`}
              color={perfMetrics.successRate >= 95 ? 'green' : 'yellow'}
            />
            <MetricItem
              label="Total Procesados"
              value={perfMetrics.totalProcessed}
              color="blue"
            />
          </div>
          
          {perfMetrics.lastProcessingTime && (
            <p className="text-gray-400 text-sm mt-3">
              Último procesamiento: {formatters.formatFirestoreDate(perfMetrics.lastProcessingTime)}
            </p>
          )}
        </div>
      )}
    </AdminCard>
  );
});

MetricsOverview.displayName = 'MetricsOverview';