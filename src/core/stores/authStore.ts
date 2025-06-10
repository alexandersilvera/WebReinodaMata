import { signal } from "@preact/signals";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/core/firebase/config";

// Definimos la estructura del estado de autenticación
type AuthState = {
  user: User | null;
  loading: boolean;
};

// Creamos un "signal" que contendrá el estado.
// Es reactivo: cuando su valor cambia, la UI se actualiza automáticamente.
export const authState = signal<AuthState>({
  user: null,
  loading: true, // Empezamos en modo "cargando"
});

// onAuthStateChanged nos notifica cada vez que el estado de login de Firebase cambia.
// Esta es la única fuente de verdad.
onAuthStateChanged(auth, (user) => {
  console.log('[AuthStore] Estado de Firebase cambiado:', user ? `Usuario ${user.uid}` : 'Sin usuario');
  // Actualizamos nuestro signal con el nuevo estado.
  authState.value = {
    user: user,
    loading: false, // Ya no estamos cargando
  };
});

// Función de utilidad para verificar si el usuario es administrador.
export function isAdmin() {
    // Aquí puedes añadir tu lógica para verificar si el email del usuario está en la lista de administradores
    // Por ahora, simplemente verificamos si el usuario está logueado.
    return authState.value.user !== null;
} 