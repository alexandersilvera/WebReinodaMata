/**
 * Script para cancelar tu registro usando la Cloud Function
 *
 * INSTRUCCIONES:
 * 1. Ve a cualquier página del sitio (ej: https://www.centroumbandistareinodamata.org)
 * 2. Asegúrate de estar autenticado (logged in)
 * 3. Abre la consola del navegador (F12 → pestaña Console)
 * 4. Copia y pega TODO este código
 * 5. Presiona Enter
 */

(async function cancelMyRegistration() {
  console.log('🔄 Iniciando cancelación de registro vía Cloud Function...\n');

  try {
    // Importar la función de Firebase
    const { httpsCallable } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-functions.js');

    // Obtener instancia de functions
    if (!window.functions) {
      console.error('❌ Firebase Functions no está inicializado');
      console.log('Asegúrate de estar en una página del sitio web');
      return;
    }

    const functions = window.functions;

    // Crear callable para la función
    const cancelEventRegistration = httpsCallable(functions, 'cancelEventRegistration');

    console.log('📞 Llamando a la Cloud Function...');

    // Llamar a la función
    const result = await cancelEventRegistration({
      userId: 'BLC1d4Yd8JbQ7k5sXsnfWHTWztA3',
      eventId: 'jca6PGwp7owwiIgior75',
      reason: 'Registro incompleto - reintentando'
    });

    console.log('✅ Respuesta de la función:', result.data);

    if (result.data.success) {
      console.log('\n✨ ¡Registro cancelado exitosamente!');
      console.log('📋 ID del registro:', result.data.registrationId);

      if (result.data.alreadyCancelled) {
        console.log('⚠️  El registro ya estaba cancelado');
      }

      console.log('\n🔄 Recargando página en 2 segundos...');
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } else {
      console.error('❌ Error:', result.data.message);
    }

  } catch (error) {
    console.error('❌ Error al ejecutar la función:', error);
    console.error('Detalles:', error.message);

    if (error.code === 'unauthenticated') {
      console.log('\n⚠️  No estás autenticado. Por favor inicia sesión primero.');
    } else if (error.code === 'permission-denied') {
      console.log('\n⚠️  No tienes permisos para cancelar este registro.');
    } else if (error.code === 'not-found') {
      console.log('\n⚠️  No se encontró el registro. Es posible que ya haya sido cancelado.');
    }
  }
})();
