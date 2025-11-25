/**
 * Analytics para Eventos de Autenticación
 * Tracking de métricas y eventos relacionados con auth
 */

export interface AuthEvent {
  event: string;
  timestamp: number;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

const STORAGE_KEY = 'auth_analytics';
const MAX_EVENTS = 100; // Máximo de eventos guardados localmente

/**
 * Registra un evento de autenticación
 */
export function trackAuthEvent(
  event: 'login' | 'register' | 'logout' | 'password_reset' | 'email_verification',
  success: boolean,
  metadata?: Record<string, any>
): void {
  const authEvent: AuthEvent = {
    event,
    timestamp: Date.now(),
    success,
    metadata,
  };

  // Guardar localmente
  saveEventLocally(authEvent);

  // Enviar a servidor si está disponible
  sendToServer(authEvent).catch(error => {
    console.warn('[AuthAnalytics] Error enviando a servidor:', error);
  });

  // Log en consola (desarrollo)
  if (import.meta.env.DEV) {
    console.log('[AuthAnalytics] Evento:', authEvent);
  }
}

/**
 * Guarda evento en localStorage
 */
function saveEventLocally(event: AuthEvent): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const events: AuthEvent[] = stored ? JSON.parse(stored) : [];

    // Agregar nuevo evento
    events.push(event);

    // Mantener solo los últimos MAX_EVENTS
    if (events.length > MAX_EVENTS) {
      events.shift();
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch (error) {
    console.error('[AuthAnalytics] Error guardando evento:', error);
  }
}

/**
 * Envía evento al servidor para tracking
 */
async function sendToServer(event: AuthEvent): Promise<void> {
  try {
    // Usar el endpoint de pageview existente o crear uno nuevo
    await fetch('/api/track-auth-event.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });
  } catch (error) {
    // No lanzar error si falla el envío al servidor
    // Los eventos se guardan localmente de todas formas
    throw error;
  }
}

/**
 * Obtiene todos los eventos guardados localmente
 */
export function getLocalEvents(): AuthEvent[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Obtiene estadísticas de eventos
 */
export function getAuthStats(): {
  totalLogins: number;
  successfulLogins: number;
  failedLogins: number;
  totalRegisters: number;
  successfulRegisters: number;
  passwordResets: number;
  emailVerifications: number;
  lastEvent?: AuthEvent;
} {
  const events = getLocalEvents();

  const stats = {
    totalLogins: 0,
    successfulLogins: 0,
    failedLogins: 0,
    totalRegisters: 0,
    successfulRegisters: 0,
    passwordResets: 0,
    emailVerifications: 0,
    lastEvent: events[events.length - 1],
  };

  events.forEach(event => {
    switch (event.event) {
      case 'login':
        stats.totalLogins++;
        if (event.success) stats.successfulLogins++;
        else stats.failedLogins++;
        break;
      case 'register':
        stats.totalRegisters++;
        if (event.success) stats.successfulRegisters++;
        break;
      case 'password_reset':
        if (event.success) stats.passwordResets++;
        break;
      case 'email_verification':
        if (event.success) stats.emailVerifications++;
        break;
    }
  });

  return stats;
}

/**
 * Limpia eventos locales (útil para testing/privacidad)
 */
export function clearAuthEvents(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('[AuthAnalytics] Error limpiando eventos:', error);
  }
}

/**
 * Obtiene eventos de las últimas N horas
 */
export function getRecentEvents(hours: number = 24): AuthEvent[] {
  const events = getLocalEvents();
  const cutoff = Date.now() - (hours * 60 * 60 * 1000);
  return events.filter(event => event.timestamp >= cutoff);
}

/**
 * Hook para facilitar el tracking en componentes React
 */
export function useAuthAnalytics() {
  return {
    trackLogin: (success: boolean, metadata?: Record<string, any>) =>
      trackAuthEvent('login', success, metadata),
    trackRegister: (success: boolean, metadata?: Record<string, any>) =>
      trackAuthEvent('register', success, metadata),
    trackLogout: () =>
      trackAuthEvent('logout', true),
    trackPasswordReset: (success: boolean, metadata?: Record<string, any>) =>
      trackAuthEvent('password_reset', success, metadata),
    trackEmailVerification: (success: boolean, metadata?: Record<string, any>) =>
      trackAuthEvent('email_verification', success, metadata),
    getStats: getAuthStats,
    getRecent: getRecentEvents,
    clear: clearAuthEvents,
  };
}
