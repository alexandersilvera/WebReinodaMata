/**
 * Widget de actividad reciente para el dashboard
 * Muestra las últimas sincronizaciones y actividad de usuarios
 */

import React from 'react';
import { useRecentActivity } from '../hooks/useAdminCache';
import { AdminCard } from './ui';
import { formatters } from '../syncMonitorService';

export const RecentActivityWidget: React.FC = React.memo(() => {
  const { data: activities, isLoading, error } = useRecentActivity(8); // Solo 8 para el widget

  if (error) {
    return (
      <AdminCard title="Actividad Reciente">
        <div className="text-red-400 text-center py-4">
          Error al cargar actividad
        </div>
      </AdminCard>
    );
  }

  return (
    <AdminCard title="Actividad Reciente" isLoading={isLoading}>
      <div className="space-y-3">
        {activities && activities.length > 0 ? (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between p-3 bg-green-800/20 rounded-lg"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.active ? 'bg-green-400' : 'bg-gray-500'
                  }`} />
                  <p className="text-white text-sm font-medium truncate">
                    {activity.email}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span className={`px-2 py-1 rounded text-xs ${
                    formatters.getSourceInfo(activity.source).color
                  } text-white`}>
                    {formatters.getSourceInfo(activity.source).label}
                  </span>
                  
                  {activity.authUid && (
                    <span className="text-green-400">✓ Sincronizado</span>
                  )}
                </div>
              </div>
              
              <div className="text-right text-xs text-gray-400">
                {formatters.formatFirestoreDate(activity.createdAt)}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p>No hay actividad reciente</p>
          </div>
        )}
      </div>
      
      {activities && activities.length > 0 && (
        <div className="mt-4 pt-3 border-t border-green-800/50">
          <a
            href="/admin/subscribers"
            className="text-green-400 hover:text-green-300 text-sm font-medium flex items-center justify-center gap-1"
          >
            Ver todos los suscriptores
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      )}
    </AdminCard>
  );
});

RecentActivityWidget.displayName = 'RecentActivityWidget';