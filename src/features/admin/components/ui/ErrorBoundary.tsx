/**
 * Error Boundary para manejar errores en componentes administrativos
 * Proporciona interfaz de recuperación y logging de errores
 */

import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class AdminErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AdminErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="bg-red-900/30 p-6 rounded-lg backdrop-blur-sm border border-red-500/30">
          <div className="flex items-center mb-4">
            <div className="text-red-500 text-2xl mr-3">⚠️</div>
            <h3 className="text-lg font-semibold text-red-500">Error en el Dashboard</h3>
          </div>
          
          <p className="text-red-300 mb-4">
            Ha ocurrido un error inesperado. El equipo técnico ha sido notificado.
          </p>
          
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mb-4">
              <summary className="cursor-pointer text-red-400 text-sm mb-2">
                Detalles técnicos (desarrollo)
              </summary>
              <pre className="text-xs text-red-300/70 bg-red-900/50 p-3 rounded overflow-auto">
                {this.state.error.message}
                {'\n'}
                {this.state.error.stack}
              </pre>
            </details>
          )}
          
          <div className="flex gap-3">
            <button
              onClick={this.handleRetry}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-md transition-colors"
            >
              Reintentar
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-md transition-colors"
            >
              Recargar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook para usar en componentes funcionales
export const useErrorHandler = () => {
  return (error: Error, errorInfo?: any) => {
    console.error('Unhandled error in admin component:', error, errorInfo);
    // Aquí podrías enviar el error a un servicio de logging
  };
};