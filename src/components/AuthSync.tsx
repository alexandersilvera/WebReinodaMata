import { useEffect, useState } from 'react';
import { auth, functions, onAuthStateChanged, httpsCallable, getFirestore, doc, setDoc, serverTimestamp, getDoc } from '@/core/firebase/config';
import type { User } from 'firebase/auth';

// Tipos para las respuestas de la función
interface SyncResponse {
  success: boolean;
  message: string;
  skipped?: boolean;
  subscriberId?: string;
}

const DEFAULT_AVATAR_URL = '/images/default-avatar.png';


/**
 * Componente que maneja la sincronización automática de usuarios Auth con suscriptores
 * y la creación de perfiles de usuario en Firestore.
 * Se debe incluir en las páginas donde los usuarios se registran o inician sesión.
 */
export default function AuthSync() {
  const [, setUser] = useState<User | null>(null);
  const [, setLoading] = useState(true);
  const [syncAttempted, setSyncAttempted] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      
      // Solo ejecutar si hay un usuario autenticado y no hemos intentado sincronizar
      if (currentUser && !syncAttempted) {
        setSyncAttempted(true);
        
        // Verificar si es un usuario recién creado (metadata de creación reciente)
        const now = new Date();
        const creationTime = new Date(currentUser.metadata.creationTime || '');
        const timeDifference = now.getTime() - creationTime.getTime();
        const fiveMinutesInMs = 5 * 60 * 1000; // 5 minutos
        
        // Si el usuario fue creado en los últimos 5 minutos, es nuevo
        const isNewUser = timeDifference <= fiveMinutesInMs;
        
        if (isNewUser) {
          console.log('✨ Usuario recién registrado detectado, creando perfil...');
          createUserProfile(currentUser); // Crear perfil de usuario
        } else {
          // Para usuarios existentes, solo asegurar que el perfil exista
          console.log('🔄 Usuario existente detectado, asegurando que el perfil exista...');
          createUserProfile(currentUser); // Asegurar que el perfil exista
        }
      }
    });

    return () => unsubscribe();
  }, [syncAttempted]);

  /**
   * Crea un documento de perfil para un nuevo usuario en Firestore.
   */
  const createUserProfile = async (user: User) => {
    const db = getFirestore();
    const userDocRef = doc(db, 'userProfiles', user.uid);

    try {
      // Verificar si el documento ya existe para no sobrescribir.
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        console.log(`El perfil para el usuario ${user.uid} ya existe en 'userProfiles'. No se creará uno nuevo.`);
        return;
      }
      
      console.log(`📝 Creando perfil de Firestore para el usuario: ${user.uid} en 'userProfiles'`);

      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0] || 'Usuario Anónimo',
        photoURL: user.photoURL || DEFAULT_AVATAR_URL,
        roles: ['user'],
        createdAt: serverTimestamp(),
        interests: [],
      };

      await setDoc(userDocRef, userData);
      console.log(`✅ Perfil de usuario creado exitosamente en Firestore para ${user.uid}`);

      // Redirigir a la página de bienvenida
      // window.location.href = '/welcome'; // Eliminado para evitar conflictos de redirección

    } catch (error) {
      console.error(`❌ Error al crear el perfil de usuario en Firestore para ${user.uid}:`, error);
      showSyncNotification('No pudimos crear tu perfil de usuario. Por favor, contacta a soporte.', 'error');
    }
  };


  

  const showSyncNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    // Definir colores según el tipo
    const typeStyles = {
      success: { bg: 'bg-green-600', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
      error: { bg: 'bg-red-600', icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z' },
      warning: { bg: 'bg-yellow-600', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z' },
      info: { bg: 'bg-blue-600', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' }
    };

    const styles = typeStyles[type];
    
    // Crear notificación temporal
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 ${styles.bg} text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full max-w-sm`;
    notification.innerHTML = `
      <div class="flex items-start space-x-3">
        <svg class="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${styles.icon}"></path>
        </svg>
        <div class="flex-1">
          <span class="text-sm font-medium">${message}</span>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="text-white/80 hover:text-white">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    `;

    document.body.appendChild(notification);

    // Animar entrada
    setTimeout(() => {
      notification.classList.remove('translate-x-full');
    }, 100);

    // Animar salida y remover después de 8 segundos (más tiempo para leer)
    setTimeout(() => {
      notification.classList.add('translate-x-full');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 8000);
  };

  // Este componente no renderiza nada visible
  return null;
}
 