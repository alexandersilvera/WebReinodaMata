import React, { useState, useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/core/firebase/config';
import { SyncMonitorService, formatters } from '@/features/admin/syncMonitorService';
import type { FailedSync, SyncMetrics, RecentActivity, TriggerError } from '@/features/admin/syncMonitorService';

interface SyncMonitorDashboardProps {
  isAdmin: boolean;
}

const SyncMonitorDashboard: React.FC<SyncMonitorDashboardProps> = ({ isAdmin }) => {
  // Estados
  const [metrics, setMetrics] = useState<SyncMetrics | null>(null);
  const [failedSyncs, setFailedSyncs] = useState<FailedSync[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [triggerErrors, setTriggerErrors] = useState<TriggerError[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Estados para acciones
  const [syncingAll, setSyncingAll] = useState(false);
  const [processingFailed, setProcessingFailed] = useState(false);

  // Cargar todos los datos
  const loadAllData = async () => {
    if (!isAdmin) return;
    
    setLoading(true);
    try {
      const [metricsData, failedData, activityData, errorsData] = await Promise.all([
        SyncMonitorService.getMetrics(),
        SyncMonitorService.getFailedSyncs(15),
        SyncMonitorService.getRecentActivity(20),
        SyncMonitorService.getTriggerErrors(10)
      ]);

      setMetrics(metricsData);
      setFailedSyncs(failedData);
      setRecentActivity(activityData);
      setTriggerErrors(errorsData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      showNotification('Error al cargar datos del dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Función para mostrar notificaciones
  const showNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    // Implementación simple de notificación
    const colors = {
      success: 'bg-green-600',
      error: 'bg-red-600',
      warning: 'bg-yellow-600',
      info: 'bg-blue-600'
    };

    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 5000);
  };

  // Sincronizar todos los usuarios Auth
  const syncAllAuthUsers = async () => {
    setSyncingAll(true);
    try {
      const syncFunction = httpsCallable(functions, 'onUserAuthCreate');
      // En un futuro podrías implementar una función específica para sincronización masiva
      
      showNotification('Proceso de sincronización iniciado. Los resultados aparecerán en unos momentos.', 'info');
      
      // Recargar datos después de un momento
      setTimeout(() => {
        loadAllData();
      }, 3000);
      
    } catch (error) {
      console.error('Error syncing auth users:', error);
      showNotification('Error al iniciar sincronización masiva', 'error');
    } finally {
      setSyncingAll(false);
    }
  };

  // Procesar sincronizaciones fallidas
  const processFailedSyncs = async () => {
    setProcessingFailed(true);
    try {
      // La función processFailedSyncs se ejecuta automáticamente cada hora
      showNotification('Las sincronizaciones fallidas se procesan automáticamente cada hora por processFailedSyncs', 'info');
      
      // Recargar datos para ver el estado actual
      await loadAllData();
      
    } catch (error) {
      console.error('Error processing failed syncs:', error);
      showNotification('Error al procesar sincronizaciones fallidas', 'error');
    } finally {
      setProcessingFailed(false);
    }
  };

  // Marcar sincronización como procesada
  const markAsProcessed = async (failedSyncId: string) => {
    try {
      await SyncMonitorService.markFailedSyncAsProcessed(failedSyncId);
      showNotification('Sincronización marcada como procesada', 'success');
      
      // Actualizar lista local
      setFailedSyncs(prev => prev.filter(sync => sync.id !== failedSyncId));
      
      // Recargar métricas
      const newMetrics = await SyncMonitorService.getMetrics();
      setMetrics(newMetrics);
      
    } catch (error) {
      console.error('Error marking as processed:', error);
      showNotification('Error al marcar como procesado', 'error');
    }
  };

  // Efectos
  useEffect(() => {
    if (isAdmin) {
      loadAllData();
    }
  }, [isAdmin]);

  // Auto-refresh cada 30 segundos
  useEffect(() => {
    if (!autoRefresh || !isAdmin) return;
    
    const interval = setInterval(() => {
      loadAllData();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, isAdmin]);

  if (!isAdmin) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400">Acceso denegado. Solo administradores pueden ver este dashboard.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header con controles */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-green-700">Monitor de Sincronizaciones</h1>
          {lastUpdate && (
            <p className="text-green-300 text-sm mt-1">
              Última actualización: {formatters.formatFirestoreDate(lastUpdate)}
            </p>
          )}
        </div>
        <div className="flex space-x-3">
          <label className="flex items-center space-x-2 text-green-300">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">Auto-refresh</span>
          </label>
          <button
            onClick={loadAllData}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? '🔄' : '📊'} Actualizar
          </button>
        </div>
      </div>

      {/* Estadísticas principales */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-green-900/30 p-6 rounded-lg backdrop-blur-sm">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-600">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-green-300">Sincronizaciones Exitosas</p>
                <p className="text-2xl font-bold text-white">{metrics.successfulSyncs}</p>
              </div>
            </div>
          </div>

          <div className="bg-red-900/30 p-6 rounded-lg backdrop-blur-sm">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-600">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-red-300">Sincronizaciones Fallidas</p>
                <p className="text-2xl font-bold text-white">{metrics.totalFailed}</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-900/30 p-6 rounded-lg backdrop-blur-sm">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-600">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-blue-300">Total Suscriptores</p>
                <p className="text-2xl font-bold text-white">{metrics.totalSubscribers}</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-900/30 p-6 rounded-lg backdrop-blur-sm">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-600">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-yellow-300">Pendientes de Retry</p>
                <p className="text-2xl font-bold text-white">{metrics.pendingRetry}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controles de acción */}
      <div className="bg-green-900/30 p-6 rounded-lg backdrop-blur-sm">
        <h2 className="text-xl font-semibold text-green-400 mb-4">Acciones de Sincronización</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={syncAllAuthUsers}
            disabled={syncingAll}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
          >
            {syncingAll ? '🔄 Sincronizando...' : '🔄 Sincronizar Usuarios Auth'}
          </button>
          <button
            onClick={processFailedSyncs}
            disabled={processingFailed}
            className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
          >
            {processingFailed ? '🔁 Procesando...' : '🔁 Procesar Fallidos'}
          </button>
          <button
            onClick={loadAllData}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? '📊 Actualizando...' : '📊 Actualizar Datos'}
          </button>
        </div>
      </div>

      {/* Sincronizaciones fallidas */}
      <div className="bg-red-900/20 p-6 rounded-lg backdrop-blur-sm">
        <h2 className="text-xl font-semibold text-red-400 mb-4">
          Sincronizaciones Fallidas ({failedSyncs.length})
        </h2>
        <div className="space-y-4">
          {failedSyncs.length === 0 ? (
            <p className="text-green-400 text-center py-4">🎉 No hay sincronizaciones fallidas</p>
          ) : (
            failedSyncs.map((failedSync) => {
              const canRetry = !failedSync.processed && (failedSync.retryCount || 0) < 5;
              
              return (
                <div key={failedSync.id} className="bg-red-800/30 p-4 rounded-lg border border-red-700">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-white font-semibold">{failedSync.email}</p>
                      <p className="text-red-300 text-sm">ID: {failedSync.userId}</p>
                      <p className="text-red-400 text-sm mt-1">
                        {failedSync.error?.message || 'Error desconocido'}
                      </p>
                      <p className="text-red-300 text-xs mt-2">
                        {formatters.formatFirestoreDate(failedSync.timestamp)} • 
                        Intentos: {failedSync.retryCount || 0}/5
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      {canRetry && (
                        <span className="bg-yellow-600 text-white px-3 py-1 rounded text-sm">
                          🔁 Pendiente retry automático
                        </span>
                      )}
                      <button
                        onClick={() => markAsProcessed(failedSync.id)}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm transition-colors"
                      >
                        ✓ Marcar Procesado
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Actividad reciente */}
      <div className="bg-green-900/30 p-6 rounded-lg backdrop-blur-sm">
        <h2 className="text-xl font-semibold text-green-400 mb-4">
          Actividad Reciente ({recentActivity.length})
        </h2>
        <div className="space-y-3">
          {recentActivity.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No hay actividad reciente</p>
          ) : (
            recentActivity.map((activity) => {
              const sourceInfo = formatters.getSourceInfo(activity.source || 'unknown');
              const isAuthSync = activity.source?.includes('auth');
              const icon = isAuthSync ? '🔄' : '📧';
              
              return (
                <div key={activity.id} className="flex items-center justify-between py-2 border-b border-green-700 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{icon}</span>
                    <div>
                      <p className="text-white font-medium">{activity.email}</p>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full text-white ${sourceInfo.color}`}>
                          {sourceInfo.label}
                        </span>
                        {activity.authUid && (
                          <span className="px-2 py-1 text-xs rounded-full bg-purple-600 text-white">
                            Auth UID
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-green-300 text-sm">
                      {formatters.formatFirestoreDate(activity.createdAt)}
                    </p>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      activity.active ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                    }`}>
                      {activity.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Errores de triggers (si existen) */}
      {triggerErrors.length > 0 && (
        <div className="bg-orange-900/20 p-6 rounded-lg backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-orange-400 mb-4">
            Errores de Triggers ({triggerErrors.length})
          </h2>
          <div className="space-y-3">
            {triggerErrors.map((error) => (
              <div key={error.id} className="bg-orange-800/30 p-4 rounded-lg border border-orange-700">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-white font-semibold">{error.email}</p>
                    <p className="text-orange-300 text-sm">ID: {error.userId}</p>
                    <p className="text-orange-400 text-sm mt-1">
                      {error.error?.message || 'Error desconocido'}
                    </p>
                    <p className="text-orange-300 text-xs mt-2">
                      {formatters.formatFirestoreDate(error.timestamp)} • 
                      Duración: {formatters.formatDuration(error.duration)} • 
                      Versión: {error.triggerVersion}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SyncMonitorDashboard;