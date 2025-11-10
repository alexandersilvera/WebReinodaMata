/**
 * Skeleton Loaders - Loading States Reutilizables
 * Proporciona una experiencia de carga consistente en toda la aplicación
 */

interface SkeletonProps {
  className?: string;
}

/**
 * Skeleton básico - rectángulo animado
 */
export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gray-700 rounded ${className}`}
      aria-label="Cargando..."
    />
  );
}

/**
 * Skeleton para cards de eventos
 */
export function SkeletonEventCard() {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-xl border border-gray-700 animate-pulse">
      {/* Imagen */}
      <div className="h-48 bg-gray-700"></div>

      {/* Contenido */}
      <div className="p-6 space-y-3">
        {/* Fecha */}
        <div className="h-4 bg-gray-700 rounded w-1/3"></div>

        {/* Título */}
        <div className="h-6 bg-gray-700 rounded w-3/4"></div>

        {/* Descripción */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-700 rounded w-5/6"></div>
        </div>

        {/* Footer */}
        <div className="flex justify-between pt-2">
          <div className="h-4 bg-gray-700 rounded w-1/4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/4"></div>
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton para cards de artículos del blog
 */
export function SkeletonArticleCard() {
  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden shadow-2xl border border-gray-700 animate-pulse">
      {/* Imagen destacada */}
      <div className="h-64 bg-gray-700"></div>

      {/* Contenido */}
      <div className="p-8 space-y-4">
        {/* Metadata */}
        <div className="flex space-x-4">
          <div className="h-4 bg-gray-700 rounded w-1/4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/4"></div>
        </div>

        {/* Título */}
        <div className="space-y-2">
          <div className="h-8 bg-gray-700 rounded w-3/4"></div>
          <div className="h-8 bg-gray-700 rounded w-1/2"></div>
        </div>

        {/* Extracto */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
            <div className="h-4 bg-gray-700 rounded w-24"></div>
          </div>
          <div className="h-4 bg-gray-700 rounded w-20"></div>
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton para lista de artículos en admin
 */
export function SkeletonArticleListItem() {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 animate-pulse">
      <div className="flex items-center space-x-4">
        {/* Thumbnail */}
        <div className="w-16 h-16 bg-gray-700 rounded flex-shrink-0"></div>

        {/* Contenido */}
        <div className="flex-grow space-y-2">
          <div className="h-5 bg-gray-700 rounded w-2/3"></div>
          <div className="h-4 bg-gray-700 rounded w-1/3"></div>
        </div>

        {/* Acciones */}
        <div className="flex space-x-2">
          <div className="w-8 h-8 bg-gray-700 rounded"></div>
          <div className="w-8 h-8 bg-gray-700 rounded"></div>
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton para tabla de datos
 */
export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      {/* Header */}
      <div className="flex space-x-4 pb-3 border-b border-gray-700">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={`header-${i}`} className="h-5 bg-gray-700 rounded flex-1"></div>
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex space-x-4">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <div key={`cell-${rowIndex}-${colIndex}`} className="h-4 bg-gray-700 rounded flex-1"></div>
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton para formulario
 */
export function SkeletonForm({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-6 animate-pulse">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={`field-${i}`} className="space-y-2">
          {/* Label */}
          <div className="h-4 bg-gray-700 rounded w-1/4"></div>
          {/* Input */}
          <div className="h-10 bg-gray-700 rounded"></div>
        </div>
      ))}

      {/* Submit button */}
      <div className="h-12 bg-gray-700 rounded w-1/3"></div>
    </div>
  );
}

/**
 * Skeleton de texto - párrafos
 */
export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2 animate-pulse">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={`line-${i}`}
          className="h-4 bg-gray-700 rounded"
          style={{ width: i === lines - 1 ? '75%' : '100%' }}
        ></div>
      ))}
    </div>
  );
}

/**
 * Skeleton de spinner circular
 */
export function Spinner({ className = '' }: SkeletonProps) {
  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div className="w-8 h-8 border-4 border-gray-700 border-t-green-600 rounded-full animate-spin"></div>
    </div>
  );
}

/**
 * Loading overlay para cubrir toda una sección
 */
export function LoadingOverlay({ message = 'Cargando...' }: { message?: string }) {
  return (
    <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center">
        <Spinner className="mb-4" />
        <p className="text-gray-300">{message}</p>
      </div>
    </div>
  );
}
