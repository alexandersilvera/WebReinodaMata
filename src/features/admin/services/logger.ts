/**
 * Sistema de logging profesional para el módulo administrativo
 * Reemplaza console.logs con logging estructurado y contextual
 */

// Niveles de logging
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

// Contextos de logging
export enum LogContext {
  ADMIN_CONFIG = 'AdminConfig',
  SYNC_MONITOR = 'SyncMonitor',
  SETTINGS = 'Settings',
  CACHE = 'Cache',
  AUTH = 'Auth',
  PERFORMANCE = 'Performance',
}

// Interfaz para entradas de log
interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  context: LogContext;
  message: string;
  data?: any;
  error?: Error;
  userId?: string;
}

// Configuración del logger
interface LoggerConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  maxLocalEntries: number;
}

class AdminLogger {
  private config: LoggerConfig;
  private localEntries: LogEntry[] = [];

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      minLevel: process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO,
      enableConsole: true,
      enableRemote: process.env.NODE_ENV === 'production',
      maxLocalEntries: 1000,
      ...config
    };
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.config.minLevel;
  }

  private formatMessage(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    const level = LogLevel[entry.level];
    const context = `[${entry.context}]`;
    
    return `${timestamp} ${level} ${context} ${entry.message}`;
  }

  private addEntry(entry: LogEntry): void {
    // Agregar a memoria local
    this.localEntries.push(entry);
    
    // Mantener límite de entradas
    if (this.localEntries.length > this.config.maxLocalEntries) {
      this.localEntries.shift();
    }

    // Log en consola si está habilitado
    if (this.config.enableConsole) {
      const formattedMessage = this.formatMessage(entry);
      
      switch (entry.level) {
        case LogLevel.DEBUG:
          console.debug(formattedMessage, entry.data);
          break;
        case LogLevel.INFO:
          console.info(formattedMessage, entry.data);
          break;
        case LogLevel.WARN:
          console.warn(formattedMessage, entry.data, entry.error);
          break;
        case LogLevel.ERROR:
          console.error(formattedMessage, entry.data, entry.error);
          break;
      }
    }

    // Envío remoto en producción
    if (this.config.enableRemote && entry.level >= LogLevel.WARN) {
      this.sendToRemote(entry).catch(err => {
        console.error('Failed to send log to remote:', err);
      });
    }
  }

  private async sendToRemote(entry: LogEntry): Promise<void> {
    // Implementación de envío a servicio de logging remoto
    // Por ahora solo un placeholder para evitar errores en producción
    try {
      // Aquí podrías enviar a Firebase Analytics, Sentry, etc.
      // await analytics.logEvent('admin_error', { ... });
    } catch (error) {
      // Silenciar errores de logging remoto para no crear loops
    }
  }

  debug(context: LogContext, message: string, data?: any): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    
    this.addEntry({
      timestamp: new Date(),
      level: LogLevel.DEBUG,
      context,
      message,
      data
    });
  }

  info(context: LogContext, message: string, data?: any): void {
    if (!this.shouldLog(LogLevel.INFO)) return;
    
    this.addEntry({
      timestamp: new Date(),
      level: LogLevel.INFO,
      context,
      message,
      data
    });
  }

  warn(context: LogContext, message: string, data?: any, error?: Error): void {
    if (!this.shouldLog(LogLevel.WARN)) return;
    
    this.addEntry({
      timestamp: new Date(),
      level: LogLevel.WARN,
      context,
      message,
      data,
      error
    });
  }

  error(context: LogContext, message: string, data?: any, error?: Error): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;
    
    this.addEntry({
      timestamp: new Date(),
      level: LogLevel.ERROR,
      context,
      message,
      data,
      error
    });
  }

  // Métodos de utilidad
  getRecentLogs(count: number = 50): LogEntry[] {
    return this.localEntries.slice(-count);
  }

  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.localEntries.filter(entry => entry.level === level);
  }

  getLogsByContext(context: LogContext): LogEntry[] {
    return this.localEntries.filter(entry => entry.context === context);
  }

  clearLogs(): void {
    this.localEntries = [];
  }

  // Método para debugging - obtener estadísticas
  getStats(): {
    totalEntries: number;
    byLevel: Record<string, number>;
    byContext: Record<string, number>;
  } {
    const byLevel: Record<string, number> = {};
    const byContext: Record<string, number> = {};

    this.localEntries.forEach(entry => {
      const levelName = LogLevel[entry.level];
      byLevel[levelName] = (byLevel[levelName] || 0) + 1;
      byContext[entry.context] = (byContext[entry.context] || 0) + 1;
    });

    return {
      totalEntries: this.localEntries.length,
      byLevel,
      byContext
    };
  }
}

// Instancia singleton del logger
export const adminLogger = new AdminLogger();

// Funciones de conveniencia para contextos específicos
export const configLogger = {
  debug: (message: string, data?: any) => adminLogger.debug(LogContext.ADMIN_CONFIG, message, data),
  info: (message: string, data?: any) => adminLogger.info(LogContext.ADMIN_CONFIG, message, data),
  warn: (message: string, data?: any, error?: Error) => adminLogger.warn(LogContext.ADMIN_CONFIG, message, data, error),
  error: (message: string, data?: any, error?: Error) => adminLogger.error(LogContext.ADMIN_CONFIG, message, data, error),
};

export const syncLogger = {
  debug: (message: string, data?: any) => adminLogger.debug(LogContext.SYNC_MONITOR, message, data),
  info: (message: string, data?: any) => adminLogger.info(LogContext.SYNC_MONITOR, message, data),
  warn: (message: string, data?: any, error?: Error) => adminLogger.warn(LogContext.SYNC_MONITOR, message, data, error),
  error: (message: string, data?: any, error?: Error) => adminLogger.error(LogContext.SYNC_MONITOR, message, data, error),
};

export const settingsLogger = {
  debug: (message: string, data?: any) => adminLogger.debug(LogContext.SETTINGS, message, data),
  info: (message: string, data?: any) => adminLogger.info(LogContext.SETTINGS, message, data),
  warn: (message: string, data?: any, error?: Error) => adminLogger.warn(LogContext.SETTINGS, message, data, error),
  error: (message: string, data?: any, error?: Error) => adminLogger.error(LogContext.SETTINGS, message, data, error),
};

export const cacheLogger = {
  debug: (message: string, data?: any) => adminLogger.debug(LogContext.CACHE, message, data),
  info: (message: string, data?: any) => adminLogger.info(LogContext.CACHE, message, data),
  warn: (message: string, data?: any, error?: Error) => adminLogger.warn(LogContext.CACHE, message, data, error),
  error: (message: string, data?: any, error?: Error) => adminLogger.error(LogContext.CACHE, message, data, error),
};

// Hook para acceder al logger en componentes React
export const useAdminLogger = () => {
  return {
    logger: adminLogger,
    getRecentLogs: () => adminLogger.getRecentLogs(),
    getStats: () => adminLogger.getStats(),
    clearLogs: () => adminLogger.clearLogs(),
  };
};