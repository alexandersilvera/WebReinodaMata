/**
 * Error Boundary Component
 * Captura errores en componentes React hijos y muestra UI de fallback
 * Previene que un error en un componente rompa toda la página
 */
import { Component } from 'react';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Actualizar el estado para que el siguiente render muestre la UI de fallback
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log del error para debugging
    console.error('Error capturado por ErrorBoundary:', error, errorInfo);

    // Callback personalizado si se proporciona
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // TODO: Enviar a servicio de monitoreo (Sentry, etc.)
    // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
  }

  render() {
    if (this.state.hasError) {
      // Mostrar UI de fallback personalizada o por defecto
      return this.props.fallback || <DefaultErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

/**
 * UI de fallback por defecto
 */
function DefaultErrorFallback({ error }: { error?: Error }) {
  return (
    <div className="min-h-[200px] flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-red-900/20 border border-red-700 rounded-lg p-6 text-center">
        <div className="text-red-400 text-4xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-white mb-2">
          Algo salió mal
        </h3>
        <p className="text-gray-300 mb-4">
          Ocurrió un error inesperado. Por favor, intenta recargar la página.
        </p>
        {error && process.env.NODE_ENV === 'development' && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-red-400 text-sm mb-2">
              Detalles del error (solo visible en desarrollo)
            </summary>
            <pre className="text-xs text-gray-400 bg-gray-900 p-3 rounded overflow-auto max-h-40">
              {error.toString()}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg transition-colors"
        >
          Recargar página
        </button>
      </div>
    </div>
  );
}

export default ErrorBoundary;
