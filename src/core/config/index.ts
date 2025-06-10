/**
 * Configuración centralizada de la aplicación
 * Maneja todas las variables de entorno y configuraciones sensibles
 */

// Tipo para definir la configuración de la aplicación
interface AppConfig {
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId?: string;
  };
  admin: {
    emails: string[];
  };
  app: {
    siteUrl: string;
    environment: 'development' | 'production' | 'test';
  };
  cors: {
    allowedOrigins: string[];
  };
}

/**
 * Valida que una variable de entorno esté presente
 */
function requireEnvVar(name: string, value: string | undefined): string {
  if (!value || value.trim() === '') {
    console.error(`Variable de entorno requerida faltante: ${name}`);
    // En producción, no lanzar error para evitar crashes, usar valores por defecto
    if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
      console.warn(`Usando valor por defecto para ${name} en producción`);
      return getDefaultValue(name);
    }
    throw new Error(`Variable de entorno requerida faltante: ${name}`);
  }
  return value.trim();
}

/**
 * Obtiene valores por defecto para variables críticas en producción
 */
function getDefaultValue(name: string): string {
  const defaults: Record<string, string> = {
    'PUBLIC_ADMIN_EMAILS': 'admin@centroumbandistareinodamata.org',
    'PUBLIC_SITE_URL': 'https://www.centroumbandistareinodamata.org',
    'PUBLIC_FIREBASE_PROJECT_ID': 'centro-umbandista-reino',
    'PUBLIC_FIREBASE_AUTH_DOMAIN': 'centro-umbandista-reino.firebaseapp.com',
    'PUBLIC_FIREBASE_STORAGE_BUCKET': 'centro-umbandista-reino.appspot.com',
  };
  return defaults[name] || '';
}

/**
 * Valida que una variable de entorno opcional esté presente o retorna un valor por defecto
 */
function getEnvVar(name: string, defaultValue: string = ''): string {
  const value = import.meta.env[name];
  return value?.trim() || defaultValue;
}

/**
 * Determina el entorno de la aplicación (development, production, test)
 * Utiliza VERCEL_ENV en Vercel o NODE_ENV en otros entornos.
 */
function getEnvironment(): 'development' | 'production' | 'test' {
  const vercelEnv = getEnvVar('VERCEL_ENV');
  if (vercelEnv) {
    return vercelEnv as 'production' | 'development' | 'test';
  }
  return (getEnvVar('NODE_ENV', 'development') as 'development' | 'production' | 'test');
}

/**
 * Parsea una lista de URLs separadas por coma
 */
function parseUrlList(urlString: string): string[] {
  return urlString
    .split(',')
    .map(url => url.trim())
    .filter(url => url.length > 0);
}

/**
 * Parsea una lista de emails separadas por coma, normalizándolos
 */
function parseEmailList(emailString: string): string[] {
  if (!emailString) {
    return [];
  }
  return emailString
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(email => email.length > 0);
}

/**
 * Valida que un email tenga un formato válido
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Configuración de la aplicación cargada desde variables de entorno
 */
export const config: AppConfig = {
  firebase: {
    apiKey: requireEnvVar('PUBLIC_FIREBASE_API_KEY', import.meta.env.PUBLIC_FIREBASE_API_KEY),
    authDomain: requireEnvVar('PUBLIC_FIREBASE_AUTH_DOMAIN', import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN),
    projectId: requireEnvVar('PUBLIC_FIREBASE_PROJECT_ID', import.meta.env.PUBLIC_FIREBASE_PROJECT_ID),
    storageBucket: requireEnvVar('PUBLIC_FIREBASE_STORAGE_BUCKET', import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET),
    messagingSenderId: requireEnvVar('PUBLIC_FIREBASE_MESSAGING_SENDER_ID', import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
    appId: requireEnvVar('PUBLIC_FIREBASE_APP_ID', import.meta.env.PUBLIC_FIREBASE_APP_ID),
    measurementId: getEnvVar('PUBLIC_FIREBASE_MEASUREMENT_ID'),
  },
  admin: {
    emails: parseEmailList(requireEnvVar('PUBLIC_ADMIN_EMAILS', import.meta.env.PUBLIC_ADMIN_EMAILS)),
  },
  app: {
    siteUrl: getEnvVar('PUBLIC_SITE_URL', 'http://localhost:4321'),
    environment: getEnvironment(),
  },
  cors: {
    allowedOrigins: parseUrlList(getEnvVar('ALLOWED_ORIGINS', 'http://localhost:4321,https://centroumbandistareinodamata.org')),
  },
};

/**
 * Validaciones adicionales de configuración
 */
function validateConfig() {
  // Validar emails de administradores
  if (config.admin.emails.length === 0 && requireEnvVar('PUBLIC_ADMIN_EMAILS', import.meta.env.PUBLIC_ADMIN_EMAILS) !== '') {
    // Esto podría suceder si PUBLIC_ADMIN_EMAILS está definido pero solo contiene comas o espacios en blanco.
    // O si parseEmailList devuelve un array vacío por alguna razón cuando no debería.
    console.warn('[Config] PUBLIC_ADMIN_EMAILS está definido pero no se parsearon emails válidos. Asegúrate de que no esté vacío o solo contenga separadores.');
  }

  config.admin.emails.forEach(email => {
    if (!isValidEmail(email)) {
      // Los emails ya están en minúsculas por parseEmailList
      throw new Error(`Email de administrador inválido en PUBLIC_ADMIN_EMAILS: ${email}`);
    }
  });

  // Validar configuración de Firebase
  if (!config.firebase.projectId || !config.firebase.apiKey) {
    throw new Error('Configuración de Firebase incompleta');
  }

  // Validar URL del sitio
  if (config.app.siteUrl && !config.app.siteUrl.startsWith('http')) {
    throw new Error('PUBLIC_SITE_URL debe comenzar con http:// o https://');
  }
}

// Ejecutar validaciones al cargar el módulo
try {
  validateConfig();
  console.log(`[Config] Configuración cargada exitosamente para entorno: ${config.app.environment}`);
} catch (error) {
  console.error('[Config] Error en la configuración:', error);
  // En producción, continuar con configuración parcial en lugar de fallar completamente
  if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
    console.warn('[Config] Continuando con configuración parcial en producción');
  } else {
    throw error;
  }
}

/**
 * Funciones de utilidad para verificar configuraciones
 */
export const configUtils = {
  /**
   * Verifica si un email es administrador
   */
  isAdminEmail: (email: string): boolean => {
    return config.admin.emails.includes(email.toLowerCase().trim());
  },

  /**
   * Verifica si estamos en desarrollo
   */
  isDevelopment: (): boolean => {
    return config.app.environment === 'development';
  },

  /**
   * Verifica si estamos en producción
   */
  isProduction: (): boolean => {
    return config.app.environment === 'production';
  },

  /**
   * Obtiene la URL base del sitio
   */
  getSiteUrl: (): string => {
    return config.app.siteUrl;
  },

  /**
   * Verifica si un origen está permitido para CORS
   */
  isOriginAllowed: (origin: string): boolean => {
    return config.cors.allowedOrigins.includes(origin);
  },
};

export default config; 