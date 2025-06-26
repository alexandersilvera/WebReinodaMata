/**
 * Servicio para gestionar la configuración de administradores
 * Centraliza la gestión de emails de admin en Firestore
 */

import { 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp,
  onSnapshot,
  Timestamp,
  FieldValue 
} from 'firebase/firestore';
import { db } from '@/core/firebase/config';

export interface AdminConfig {
  emails: string[];
  lastUpdated: Timestamp | FieldValue;
  updatedBy: string;
}

const ADMIN_CONFIG_DOC = 'siteConfig/adminEmails';

/**
 * Obtener la configuración actual de administradores desde Firestore
 */
export async function getAdminConfig(): Promise<AdminConfig | null> {
  try {
    const configDoc = await getDoc(doc(db, ADMIN_CONFIG_DOC));
    
    if (configDoc.exists()) {
      return configDoc.data() as AdminConfig;
    }
    
    return null;
  } catch (error) {
    console.warn('No se pudo obtener configuración de admin desde Firestore:', error);
    // No lanzar error para permitir fallback
    return null;
  }
}

/**
 * Actualizar la configuración de administradores en Firestore
 */
export async function updateAdminConfig(
  emails: string[], 
  updatedBy: string
): Promise<void> {
  try {
    // Validar emails
    emails.forEach(email => {
      if (!isValidEmail(email)) {
        throw new Error(`Email inválido: ${email}`);
      }
    });

    const configData: AdminConfig = {
      emails: emails.map(email => email.toLowerCase().trim()),
      lastUpdated: serverTimestamp(),
      updatedBy
    };

    await setDoc(doc(db, ADMIN_CONFIG_DOC), configData);
    
    console.log('[AdminConfig] Configuración actualizada:', configData);
  } catch (error) {
    console.error('Error al actualizar configuración de admin:', error);
    throw error;
  }
}

/**
 * Validar formato de email
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Obtener emails de admin con fallback a configuración por defecto
 */
export async function getAdminEmails(): Promise<string[]> {
  // Intentar obtener desde Firestore primero
  const config = await getAdminConfig();
  
  if (config && config.emails.length > 0) {
    console.log('[AdminConfig] Usando configuración dinámica de Firestore');
    return config.emails;
  }
  
  // Fallback a variables de entorno si no hay configuración en Firestore
  console.log('[AdminConfig] Usando configuración estática de variables de entorno');
  return await getAdminEmailsFromEnv();
}

/**
 * Obtener emails de admin desde variables de entorno (fallback)
 */
async function getAdminEmailsFromEnv(): Promise<string[]> {
  try {
    // Importar dinámicamente para evitar problemas de SSR
    if (typeof window !== 'undefined') {
      // En cliente, usar la configuración ya cargada
      const configModule = await import('@/core/config');
      return configModule.config.admin.emails;
    }
    
    // En servidor, fallback de emergencia
    return [
      'admin@example.com',
      'admin@centroumbandistareinodamata.org',
      'administrador@centroumbandistareinodamata.org'
    ];
  } catch (error) {
    console.warn('[AdminConfig] Error al importar configuración, usando fallback de emergencia:', error);
    return [
      'admin@example.com',
      'admin@centroumbandistareinodamata.org',
      'administrador@centroumbandistareinodamata.org'
    ];
  }
}

/**
 * Verificar si un email es administrador
 */
export async function isAdminEmail(email: string): Promise<boolean> {
  if (!email) return false;
  
  const adminEmails = await getAdminEmails();
  return adminEmails.includes(email.toLowerCase().trim());
}

/**
 * Suscribirse a cambios en la configuración de administradores
 */
export function subscribeToAdminConfig(
  callback: (config: AdminConfig | null) => void
): () => void {
  return onSnapshot(
    doc(db, ADMIN_CONFIG_DOC), 
    (docSnapshot) => {
      if (docSnapshot.exists()) {
        callback(docSnapshot.data() as AdminConfig);
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error('Error en suscripción a admin config:', error);
      callback(null);
    }
  );
}

/**
 * Inicializar configuración de administradores si no existe
 */
export async function initializeAdminConfig(): Promise<void> {
  try {
    const existingConfig = await getAdminConfig();
    
    if (!existingConfig) {
      // Crear configuración inicial desde variables de entorno
      const envEmails = getAdminEmailsFromEnv();
      await updateAdminConfig(
        await envEmails, 
        'system-initialization'
      );
      
      console.log('[AdminConfig] Configuración inicial creada');
    }
  } catch (error) {
    console.error('[AdminConfig] Error al inicializar configuración:', error);
  }
}