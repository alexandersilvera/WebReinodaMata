/**
 * Provider principal para el sistema administrativo
 * Combina todos los providers necesarios en uno solo
 */

import React from 'react';
import { AdminQueryProvider } from './AdminQueryProvider';
import { AdminErrorBoundary } from './ui';

interface AdminProviderProps {
  children: React.ReactNode;
  showDevtools?: boolean;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ 
  children, 
  showDevtools 
}) => {
  return (
    <AdminQueryProvider showDevtools={showDevtools}>
      <AdminErrorBoundary>
        {children}
      </AdminErrorBoundary>
    </AdminQueryProvider>
  );
};