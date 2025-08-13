// Exportaciones del módulo administrativo
import SyncController from './SyncController';

export {
  SyncController
};

// Exportaciones de componentes optimizados
export { AdminDashboard } from './components/AdminDashboard';
export { AdminQueryProvider } from './components/AdminQueryProvider';
export { MetricsOverview } from './components/MetricsOverview';
export { RecentActivityWidget } from './components/RecentActivityWidget';
export { FailedSyncsWidget } from './components/FailedSyncsWidget';

// Exportaciones de UI components
export * from './components/ui';

// Exportaciones de hooks
export * from './hooks/useAdminCache';

// Exportaciones de servicios
export * from './services/queryClient';