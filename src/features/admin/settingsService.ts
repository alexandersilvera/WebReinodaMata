import { db } from "@/core/firebase/config"; // Assuming this is the correct path to your Firebase config
import { doc, setDoc, getDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { settingsLogger } from './services/logger';

export interface SiteSettings {
  siteTitle?: string;
  siteDescription?: string;
  contactEmail?: string;
  metaKeywords?: string;
  googleAnalytics?: string;
  enableSitemap?: boolean;
  enableComments?: boolean;
  moderateComments?: boolean;
  requireLogin?: boolean;
  enableNewsletter?: boolean;
  newsletterFrequency?: 'weekly' | 'biweekly' | 'monthly';
  welcomeEmail?: string;
  updatedAt?: Timestamp; // Firestore Timestamp for updates
}

const SETTINGS_DOC_PATH = "settings/general"; // Path to the settings document

/**
 * Carga la configuración del sitio desde Firestore.
 * @returns Una promesa que resuelve a SiteSettings | null.
 */
export async function loadSettings(): Promise<SiteSettings | null> {
  try {
    const docRef = doc(db, SETTINGS_DOC_PATH);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as SiteSettings;
    } else {
      settingsLogger.info('No se encontró el documento de configuración, se devolverán valores por defecto o nulos');
      return null; // O podrías devolver un objeto SiteSettings con valores por defecto
    }
  } catch (error) {
    settingsLogger.error('Error al cargar la configuración del sitio', { error });
    throw new Error("No se pudo cargar la configuración del sitio."); // Re-lanzar para que la página lo maneje
  }
}

/**
 * Valida la configuración antes de guardar
 */
function validateSettings(settings: Partial<SiteSettings>): void {
  // Validar email si está presente
  if (settings.contactEmail && settings.contactEmail.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(settings.contactEmail)) {
      throw new Error('El email de contacto no tiene un formato válido');
    }
  }

  // Validar frecuencia de newsletter
  if (settings.newsletterFrequency) {
    const validFrequencies = ['weekly', 'biweekly', 'monthly'];
    if (!validFrequencies.includes(settings.newsletterFrequency)) {
      throw new Error('Frecuencia de newsletter no válida');
    }
  }

  // Validar longitud de strings
  const stringFields = ['siteTitle', 'siteDescription', 'metaKeywords', 'welcomeEmail'] as const;
  for (const field of stringFields) {
    const value = settings[field];
    if (typeof value === 'string' && value.length > 1000) {
      throw new Error(`El campo ${field} es demasiado largo (máximo 1000 caracteres)`);
    }
  }
}

/**
 * Sanitiza la configuración antes de guardar
 */
function sanitizeSettings(settings: Partial<SiteSettings>): Partial<SiteSettings> {
  const sanitized = { ...settings };

  // Limpiar strings
  const stringFields = ['siteTitle', 'siteDescription', 'contactEmail', 'metaKeywords', 'googleAnalytics', 'welcomeEmail'] as const;
  for (const field of stringFields) {
    const value = sanitized[field];
    if (typeof value === 'string') {
      (sanitized as any)[field] = value.trim();
    }
  }

  // Normalizar email
  if (sanitized.contactEmail) {
    sanitized.contactEmail = sanitized.contactEmail.toLowerCase();
  }

  return sanitized;
}

/**
 * Guarda la configuración del sitio en Firestore.
 * @param settings Un objeto parcial de SiteSettings con los campos a actualizar.
 * @returns Una promesa que resuelve cuando la operación se completa.
 */
export async function saveSettings(settings: Partial<SiteSettings>): Promise<void> {
  try {
    // Validar configuración
    validateSettings(settings);
    
    // Sanitizar configuración
    const sanitizedSettings = sanitizeSettings(settings);
    
    const docRef = doc(db, SETTINGS_DOC_PATH);
    // Añadir/actualizar el campo updatedAt con el timestamp del servidor
    const settingsToSave = {
      ...sanitizedSettings,
      updatedAt: serverTimestamp(),
    };

    await setDoc(docRef, settingsToSave, { merge: true });
    
    settingsLogger.info('Configuración guardada exitosamente', { 
      fields: Object.keys(sanitizedSettings),
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    settingsLogger.error('Error al guardar la configuración del sitio', { error, settings });
    
    if (error instanceof Error && error.message.includes('formato válido')) {
      throw error; // Re-lanzar errores de validación tal como están
    }
    
    throw new Error("No se pudo guardar la configuración del sitio."); // Re-lanzar para que la página lo maneje
  }
}
