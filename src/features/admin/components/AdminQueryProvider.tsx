/**
 * Provider de React Query para el sistema administrativo
 * Configura el contexto de caching para todas las páginas de admin
 */

import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { adminQueryClient } from '../services/queryClient';

interface AdminQueryProviderProps {
  children: React.ReactNode;
  showDevtools?: boolean;
}

export const AdminQueryProvider: React.FC<AdminQueryProviderProps> = ({ 
  children, 
  showDevtools = process.env.NODE_ENV === 'development' 
}) => {
  return (
    <QueryClientProvider client={adminQueryClient}>
      {children}
      {showDevtools && (
        <ReactQueryDevtools 
          initialIsOpen={false}
        />
      )}
    </QueryClientProvider>
  );
};