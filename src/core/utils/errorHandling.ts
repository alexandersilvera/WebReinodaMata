/**
 * Utilidades para manejo seguro de errores
 * Evita exponer información sensible en producción
 */

/**
 * Determina si estamos en modo desarrollo
 */
const isDevelopment = import.meta.env.DEV;

/**
 * Loggea un error de manera segura
 * En desarrollo: muestra todos los detalles
 * En producción: solo muestra un mensaje genérico
 *
 * @param message Mensaje genérico para producción
 * @param error Error completo (solo se muestra en desarrollo)
 */
export function logError(message: string, error?: unknown): void {
  if (isDevelopment) {
    console.error(message, error);
  } else {
    // En producción, solo el mensaje genérico
    console.error(message);
  }
}

/**
 * Loggea una advertencia de manera segura
 *
 * @param message Mensaje genérico para producción
 * @param details Detalles (solo se muestran en desarrollo)
 */
export function logWarning(message: string, details?: unknown): void {
  if (isDevelopment) {
    console.warn(message, details);
  } else {
    console.warn(message);
  }
}

/**
 * Extrae un mensaje de error seguro para mostrar al usuario
 *
 * @param error El error capturado
 * @param fallbackMessage Mensaje por defecto si no se puede extraer uno
 * @returns Mensaje seguro para mostrar al usuario
 */
export function getSafeErrorMessage(
  error: unknown,
  fallbackMessage: string = 'Ha ocurrido un error. Por favor, intenta más tarde.'
): string {
  // En desarrollo, podemos ser más específicos
  if (isDevelopment && error instanceof Error) {
    return error.message;
  }

  // En producción, siempre devolver el mensaje genérico
  return fallbackMessage;
}

/**
 * Verifica si un error es de Firebase
 */
export function isFirebaseError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as any).code === 'string' &&
    (error as any).code.includes('/')
  );
}

/**
 * Maneja errores de Firebase de manera segura
 * Útil para evitar exponer detalles técnicos de Firebase en producción
 *
 * @param error Error de Firebase
 * @param context Contexto donde ocurrió el error (para logging)
 * @returns Mensaje seguro para mostrar al usuario
 */
export function handleFirebaseError(
  error: unknown,
  context: string
): string {
  logError(`Error en ${context}:`, error);

  // Mensajes específicos solo en desarrollo
  if (isDevelopment && isFirebaseError(error)) {
    const firebaseError = error as { code: string; message: string };

    // Mapear códigos de error comunes a mensajes amigables
    const errorMessages: Record<string, string> = {
      'permission-denied': 'No tienes permisos para realizar esta acción',
      'not-found': 'El recurso solicitado no existe',
      'already-exists': 'Este recurso ya existe',
      'unauthenticated': 'Debes iniciar sesión para continuar',
      'unavailable': 'El servicio no está disponible temporalmente',
    };

    for (const [code, message] of Object.entries(errorMessages)) {
      if (firebaseError.code.includes(code)) {
        return message;
      }
    }

    return firebaseError.message;
  }

  // En producción, mensaje genérico
  return 'Ha ocurrido un error. Por favor, intenta más tarde.';
}
