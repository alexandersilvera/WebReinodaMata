// Configuración de Firebase
// Este archivo contiene la configuración de Firebase para la aplicación

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, setDoc, serverTimestamp, collection, query, where, getDocs, enableNetwork, disableNetwork, orderBy, deleteDoc } from "firebase/firestore";
import { getAuth, setPersistence, browserLocalPersistence, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFunctions, httpsCallable } from "firebase/functions";
import { config, configUtils } from '../config';

// NOTA: En aplicaciones web de Firebase, la apiKey es segura para incluir en el código del cliente.
// Firebase utiliza restricciones de dominio y otras medidas de seguridad para proteger tu proyecto,
// no mediante el ocultamiento de la apiKey. Sin embargo, es buena práctica usar variables de entorno
// para mayor flexibilidad entre entornos de desarrollo y producción.

// Usar la configuración centralizada
export const firebaseConfig = {
  apiKey: config.firebase.apiKey,
  authDomain: config.firebase.authDomain,
  projectId: config.firebase.projectId,
  storageBucket: config.firebase.storageBucket,
  messagingSenderId: config.firebase.messagingSenderId,
  appId: config.firebase.appId,
  measurementId: config.firebase.measurementId
};

// Inicializar Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Exportar funciones de Firebase Auth para uso en scripts del cliente
export { onAuthStateChanged, signInWithEmailAndPassword, signOut };

// Exportar funciones de Firestore para uso en scripts del cliente
export { doc, setDoc, serverTimestamp, collection, query, where, getDocs, enableNetwork, disableNetwork, orderBy, deleteDoc };

// Exportar funciones de Firebase Functions para uso en scripts del cliente
export { httpsCallable };

// Conectar al emulador de funciones en desarrollo local
if (configUtils.isDevelopment() && typeof window !== 'undefined') {
  // Descomentar estas líneas para usar emuladores locales durante el desarrollo
  // connectFunctionsEmulator(functions, 'localhost', 5001);
  console.log('[Firebase] Modo desarrollo detectado');
}

// Set persistence to LOCAL (sobrevive cierre de pestañas/navegador)
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence)
    .then(() => {
      console.log('[Firebase] Persistencia local establecida correctamente');
    })
    .catch((error) => {
      console.error('[Firebase] Error al establecer persistencia:', error);
    });
} 

/**
 * Utilidades de Firebase específicas para la aplicación
 */
export const firebaseUtils = {
  /**
   * Verifica si un usuario es administrador basado en la configuración centralizada
   */
  isUserAdmin: (email: string | null | undefined): boolean => {
    if (!email) return false;
    return configUtils.isAdminEmail(email);
  },

  /**
   * Obtiene información del entorno de Firebase
   */
  getEnvironmentInfo: () => ({
    projectId: config.firebase.projectId,
    environment: config.app.environment,
    isDevelopment: configUtils.isDevelopment(),
    isProduction: configUtils.isProduction(),
  }),
}; 