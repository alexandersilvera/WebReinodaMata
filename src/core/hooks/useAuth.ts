import { useState, useEffect } from 'react';
import {
  type User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, firebaseUtils } from '../firebase/config';

/**
 * Hook personalizado para gestionar la autenticación
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar si el usuario es administrador usando la configuración centralizada
  const isAdmin = user ? firebaseUtils.isUserAdmin(user.email) : false;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth, 
      (currentUser) => {
        console.log('[useAuth] Estado de autenticación cambió:', {
          user: !!currentUser,
          email: currentUser?.email,
          isAdmin: currentUser ? firebaseUtils.isUserAdmin(currentUser.email) : false
        });
      setUser(currentUser);
      setLoading(false);
        setError(null);
      },
      (error) => {
        console.error('[useAuth] Error en autenticación:', error);
        setLoading(false);
        setError(`Error de autenticación: ${error.message}`);
      }
    );

    return () => unsubscribe();
  }, []);

  // Iniciar sesión con manejo de errores mejorado
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('[useAuth] Intentando iniciar sesión para:', email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      console.log('[useAuth] Login exitoso:', {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        isAdmin: firebaseUtils.isUserAdmin(userCredential.user.email)
      });
      
      return { success: true, user: userCredential.user };
    } catch (err: any) {
      console.error('[useAuth] Error en login:', err);
      
      // Mapear errores específicos de Firebase a mensajes amigables
      let friendlyMessage = 'Error al iniciar sesión';
      
      switch (err.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          friendlyMessage = 'Correo electrónico o contraseña incorrectos';
          break;
        case 'auth/invalid-email':
          friendlyMessage = 'El formato del correo electrónico no es válido';
          break;
        case 'auth/user-disabled':
          friendlyMessage = 'Esta cuenta ha sido deshabilitada';
          break;
        case 'auth/too-many-requests':
          friendlyMessage = 'Demasiados intentos fallidos. Intenta más tarde';
          break;
        case 'auth/network-request-failed':
          friendlyMessage = 'Error de conexión. Verifica tu internet';
          break;
        default:
          friendlyMessage = err.message || 'Error desconocido';
      }
      
      setError(friendlyMessage);
      return { success: false, error: friendlyMessage };
    } finally {
      setLoading(false);
    }
  };

  // Registrar usuario con validaciones mejoradas
  const register = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Validaciones previas
      if (!email || !email.includes('@')) {
        throw new Error('Correo electrónico inválido');
      }
      
      if (!password || password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }
      
      console.log('[useAuth] Intentando registrar usuario:', email);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      console.log('[useAuth] Registro exitoso:', {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        isAdmin: firebaseUtils.isUserAdmin(userCredential.user.email)
      });
      
      return { success: true, user: userCredential.user };
    } catch (err: any) {
      console.error('[useAuth] Error en registro:', err);
      
      // Mapear errores específicos de Firebase a mensajes amigables
      let friendlyMessage = 'Error al registrar usuario';
      
      switch (err.code) {
        case 'auth/email-already-in-use':
          friendlyMessage = 'Este correo electrónico ya está registrado';
          break;
        case 'auth/invalid-email':
          friendlyMessage = 'El formato del correo electrónico no es válido';
          break;
        case 'auth/weak-password':
          friendlyMessage = 'La contraseña es demasiado débil';
          break;
        case 'auth/network-request-failed':
          friendlyMessage = 'Error de conexión. Verifica tu internet';
          break;
        default:
          friendlyMessage = err.message || 'Error desconocido';
      }
      
      setError(friendlyMessage);
      return { success: false, error: friendlyMessage };
    } finally {
      setLoading(false);
    }
  };

  // Cerrar sesión con manejo de errores
  const logout = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('[useAuth] Cerrando sesión...');
      await signOut(auth);
      console.log('[useAuth] Sesión cerrada exitosamente');
      return { success: true };
    } catch (err: any) {
      console.error('[useAuth] Error al cerrar sesión:', err);
      const friendlyMessage = err.message || 'Error al cerrar sesión';
      setError(friendlyMessage);
      return { success: false, error: friendlyMessage };
    } finally {
      setLoading(false);
    }
  };

  // Limpiar errores
  const clearError = () => {
    setError(null);
  };

  // Obtener información del usuario actual
  const getUserInfo = () => ({
    uid: user?.uid || null,
    email: user?.email || null,
    emailVerified: user?.emailVerified || false,
    isAdmin,
    displayName: user?.displayName || null,
    photoURL: user?.photoURL || null,
  });

  return {
    user,
    loading,
    error,
    isAdmin,
    login,
    register,
    logout,
    clearError,
    getUserInfo,
    // Información adicional del entorno
    environmentInfo: firebaseUtils.getEnvironmentInfo(),
  };
} 