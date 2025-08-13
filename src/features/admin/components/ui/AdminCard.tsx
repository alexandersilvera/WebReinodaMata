/**
 * Componente de tarjeta reutilizable para el dashboard administrativo
 * Proporciona estructura consistente y responsive
 */

import React from 'react';

interface AdminCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  span?: 1 | 2 | 3; // Para grid spans
  action?: React.ReactNode;
  isLoading?: boolean;
}

export const AdminCard: React.FC<AdminCardProps> = React.memo(({
  title,
  children,
  className = '',
  span = 1,
  action,
  isLoading = false
}) => {
  const spanClass = {
    1: 'col-span-1',
    2: 'col-span-1 lg:col-span-2',
    3: 'col-span-1 lg:col-span-3'
  }[span];

  return (
    <div className={`bg-green-900/30 p-6 rounded-lg backdrop-blur-sm ${spanClass} ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-green-500">{title}</h3>
        {action && <div className="text-sm">{action}</div>}
      </div>
      
      <div className={`${isLoading ? 'opacity-50' : ''}`}>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="md" />
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
});

AdminCard.displayName = 'AdminCard';

// Componente de spinner optimizado
export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = React.memo(({ 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className="flex items-center justify-center">
      <div className={`animate-spin rounded-full border-b-2 border-green-500 ${sizeClasses[size]}`}>
        <span className="sr-only">Cargando...</span>
      </div>
    </div>
  );
});

LoadingSpinner.displayName = 'LoadingSpinner';