/**
 * Rate Limiter Client-Side
 * Previene ataques de fuerza bruta limitando intentos de autenticación
 */

interface RateLimitData {
  attempts: number;
  lastAttempt: number;
  blockedUntil: number | null;
}

const STORAGE_KEY = 'auth_rate_limit';
const MAX_ATTEMPTS = 5;
const BLOCK_DURATION = 15 * 60 * 1000; // 15 minutos en milisegundos
const ATTEMPT_WINDOW = 5 * 60 * 1000; // 5 minutos - ventana para resetear contador

/**
 * Obtiene los datos de rate limiting desde localStorage
 */
function getRateLimitData(key: string): RateLimitData {
  try {
    const data = localStorage.getItem(`${STORAGE_KEY}_${key}`);
    if (!data) {
      return { attempts: 0, lastAttempt: 0, blockedUntil: null };
    }
    return JSON.parse(data);
  } catch {
    return { attempts: 0, lastAttempt: 0, blockedUntil: null };
  }
}

/**
 * Guarda los datos de rate limiting en localStorage
 */
function setRateLimitData(key: string, data: RateLimitData): void {
  try {
    localStorage.setItem(`${STORAGE_KEY}_${key}`, JSON.stringify(data));
  } catch (error) {
    console.error('[RateLimiter] Error saving data:', error);
  }
}

/**
 * Verifica si el usuario está bloqueado
 */
export function isBlocked(key: string = 'default'): { blocked: boolean; remainingTime?: number } {
  const data = getRateLimitData(key);
  const now = Date.now();

  // Si está bloqueado y el tiempo no ha expirado
  if (data.blockedUntil && data.blockedUntil > now) {
    const remainingTime = Math.ceil((data.blockedUntil - now) / 1000); // en segundos
    return { blocked: true, remainingTime };
  }

  // Si el bloqueo expiró, resetear
  if (data.blockedUntil && data.blockedUntil <= now) {
    setRateLimitData(key, { attempts: 0, lastAttempt: 0, blockedUntil: null });
  }

  return { blocked: false };
}

/**
 * Registra un intento fallido
 */
export function recordFailedAttempt(key: string = 'default'): { blocked: boolean; remainingAttempts: number; blockedUntil?: number } {
  const data = getRateLimitData(key);
  const now = Date.now();

  // Si la ventana de tiempo expiró, resetear contador
  if (data.lastAttempt && (now - data.lastAttempt) > ATTEMPT_WINDOW) {
    data.attempts = 0;
  }

  // Incrementar intentos
  data.attempts += 1;
  data.lastAttempt = now;

  // Si alcanzó el máximo, bloquear
  if (data.attempts >= MAX_ATTEMPTS) {
    data.blockedUntil = now + BLOCK_DURATION;
    setRateLimitData(key, data);
    return {
      blocked: true,
      remainingAttempts: 0,
      blockedUntil: data.blockedUntil
    };
  }

  setRateLimitData(key, data);
  return {
    blocked: false,
    remainingAttempts: MAX_ATTEMPTS - data.attempts
  };
}

/**
 * Registra un intento exitoso y resetea el contador
 */
export function recordSuccessfulAttempt(key: string = 'default'): void {
  setRateLimitData(key, { attempts: 0, lastAttempt: 0, blockedUntil: null });
}

/**
 * Obtiene el número de intentos restantes
 */
export function getRemainingAttempts(key: string = 'default'): number {
  const blockStatus = isBlocked(key);
  if (blockStatus.blocked) return 0;

  const data = getRateLimitData(key);
  const now = Date.now();

  // Si la ventana expiró, tiene todos los intentos disponibles
  if (data.lastAttempt && (now - data.lastAttempt) > ATTEMPT_WINDOW) {
    return MAX_ATTEMPTS;
  }

  return Math.max(0, MAX_ATTEMPTS - data.attempts);
}

/**
 * Formatea el tiempo restante de bloqueo en formato legible
 */
export function formatBlockTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} segundo${seconds !== 1 ? 's' : ''}`;
  }
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} minuto${minutes !== 1 ? 's' : ''}`;
}

/**
 * Limpia todos los datos de rate limiting (útil para testing)
 */
export function clearRateLimitData(key: string = 'default'): void {
  try {
    localStorage.removeItem(`${STORAGE_KEY}_${key}`);
  } catch (error) {
    console.error('[RateLimiter] Error clearing data:', error);
  }
}
