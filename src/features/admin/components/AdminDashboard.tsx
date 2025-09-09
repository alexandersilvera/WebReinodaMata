/**
 * Dashboard administrativo principal con lazy loading y optimizaciones
 * Proporciona vista general del sistema con widgets interactivos
 */

import React, { Suspense, lazy } from 'react';
import { AdminQueryProvider } from './AdminQueryProvider';
import { AdminErrorBoundary, AdminCard, LoadingSpinner } from './ui';
import { usePrefetchAdminData } from '../hooks/useAdminCache';
import { useRBAC } from '../hooks/useRBAC';
import { Permission } from '../roles/types';

// Lazy loading de componentes pesados
const MetricsOverview = lazy(() => 
  import('./MetricsOverview').then(module => ({ default: module.MetricsOverview }))
);

const RecentActivityWidget = lazy(() => 
  import('./RecentActivityWidget').then(module => ({ default: module.RecentActivityWidget }))
);

const FailedSyncsWidget = lazy(() => 
  import('./FailedSyncsWidget').then(module => ({ default: module.FailedSyncsWidget }))
);

// Componente de acciones rápidas
const QuickActions: React.FC = React.memo(() => {
  const rbac = useRBAC();
  
  // Definir links con sus permisos requeridos
  const allQuickLinks = [
    {
      title: 'Artículos',
      description: 'Gestionar contenido',
      href: '/admin/articles',
      icon: '📄',
      color: 'bg-blue-600 hover:bg-blue-500',
      requiredPermission: Permission.ARTICLES_READ
    },
    {
      title: 'Suscriptores',
      description: 'Ver lista completa',
      href: '/admin/subscribers',
      icon: '👥',
      color: 'bg-green-600 hover:bg-green-500',
      requiredPermission: Permission.SUBSCRIBERS_READ
    },
    {
      title: 'Newsletter',
      description: 'Enviar boletín',
      href: '/admin/newsletter',
      icon: '📧',
      color: 'bg-purple-600 hover:bg-purple-500',
      requiredPermission: Permission.NEWSLETTER_SEND
    },
    {
      title: 'Configuración',
      description: 'Ajustes del sitio',
      href: '/admin/settings',
      icon: '⚙️',
      color: 'bg-gray-600 hover:bg-gray-500',
      requiredPermission: Permission.SETTINGS_READ
    },
    {
      title: 'Gestión de Roles',
      description: 'Administrar usuarios',
      href: '/admin/roles',
      icon: '👤',
      color: 'bg-red-600 hover:bg-red-500',
      requiredPermission: Permission.ROLES_MANAGE
    }
  ];

  // Filtrar links basado en permisos
  const quickLinks = allQuickLinks.filter(link => 
    rbac.hasPermission(link.requiredPermission)
  );

  return (
    <AdminCard title="Acciones Rápidas">
      <div className="grid grid-cols-2 gap-3">
        {quickLinks.length === 0 ? (
          <div className="col-span-2 text-center py-4">
            <p className="text-gray-400 text-sm">
              No tienes permisos para ninguna acción administrativa.
            </p>
          </div>
        ) : (
          quickLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`p-3 rounded-lg text-white transition-colors ${link.color} flex flex-col items-center text-center`}
              title={`Requiere: ${link.requiredPermission}`}
            >
              <div className="text-2xl mb-1">{link.icon}</div>
              <div className="text-sm font-medium">{link.title}</div>
              <div className="text-xs opacity-80">{link.description}</div>
            </a>
          ))
        )}
      </div>
    </AdminCard>
  );
});

QuickActions.displayName = 'QuickActions';

// Componente del estado del sistema
const SystemStatus: React.FC = React.memo(() => {
  const { prefetchCriticalData } = usePrefetchAdminData();

  React.useEffect(() => {
    // Prefetch de datos críticos al montar el dashboard
    prefetchCriticalData();
  }, [prefetchCriticalData]);

  return (
    <AdminCard title="Estado del Sistema">
      <div className="space-y-3">
        <div className="flex justify-between items-center p-2 bg-green-800/20 rounded">
          <span className="text-white text-sm">Firebase</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-green-400 text-sm">Conectado</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center p-2 bg-green-800/20 rounded">
          <span className="text-white text-sm">Cache</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-green-400 text-sm">Activo</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center p-2 bg-green-800/20 rounded">
          <span className="text-white text-sm">Funciones</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-green-400 text-sm">Operativas</span>
          </div>
        </div>
      </div>
    </AdminCard>
  );
});

SystemStatus.displayName = 'SystemStatus';

// Fallback de loading para componentes lazy
const LazyLoadingFallback: React.FC = () => (
  <div className="flex justify-center items-center h-32">
    <LoadingSpinner size="md" />
  </div>
);

// Componente principal del dashboard
export const AdminDashboard: React.FC = React.memo(() => {
  const rbac = useRBAC();

  return (
    <AdminQueryProvider>
      <AdminErrorBoundary>
        <div className="max-w-7xl mx-auto w-full px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-green-700 mb-2">
                  Panel de Administración
                </h1>
                <p className="text-gray-300">
                  Bienvenido al centro de control de Reino Da Mata
                </p>
              </div>
              
              {/* Información del rol */}
              {rbac.roleDefinition && (
                <div className="bg-green-800/20 border border-green-600/30 rounded-lg p-3">
                  <div className="text-right">
                    <p className="text-green-400 font-medium text-sm">
                      {rbac.roleDefinition.name}
                    </p>
                    <p className="text-gray-400 text-xs">
                      Nivel {rbac.getRoleLevel()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Métricas principales - span 2 columnas */}
            {rbac.canReadMetrics && (
              <AdminErrorBoundary>
                <Suspense fallback={<LazyLoadingFallback />}>
                  <MetricsOverview />
                </Suspense>
              </AdminErrorBoundary>
            )}

            {/* Acciones rápidas */}
            <QuickActions />
          </div>

          {/* Segunda fila */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Actividad reciente */}
            {(rbac.canReadSubscribers || rbac.canReadArticles) && (
              <AdminErrorBoundary>
                <Suspense fallback={<LazyLoadingFallback />}>
                  <RecentActivityWidget />
                </Suspense>
              </AdminErrorBoundary>
            )}

            {/* Sincronizaciones fallidas */}
            {rbac.hasPermission(Permission.SYNC_MONITOR) && (
              <AdminErrorBoundary>
                <Suspense fallback={<LazyLoadingFallback />}>
                  <FailedSyncsWidget />
                </Suspense>
              </AdminErrorBoundary>
            )}

            {/* Estado del sistema */}
            {rbac.canReadMetrics && <SystemStatus />}
          </div>

          {/* Footer del dashboard */}
          <div className="mt-8 pt-6 border-t border-green-800/50">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-gray-400 text-sm">
                Última actualización: {new Date().toLocaleString('es-ES')}
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => window.location.reload()}
                  className="px-3 py-1 text-sm bg-green-600 hover:bg-green-500 text-white rounded transition-colors"
                >
                  Actualizar
                </button>
                <a
                  href="/admin/sync-monitor"
                  className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
                >
                  Monitor Completo
                </a>
              </div>
            </div>
          </div>
        </div>
      </AdminErrorBoundary>
    </AdminQueryProvider>
  );
});

AdminDashboard.displayName = 'AdminDashboard';