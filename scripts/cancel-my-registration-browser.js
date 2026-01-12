/**
 * Script para ejecutar en la consola del navegador
 * Para cancelar un registro incompleto
 *
 * INSTRUCCIONES:
 * 1. Abre la página del evento en tu navegador
 * 2. Asegúrate de estar autenticado
 * 3. Abre la consola del navegador (F12)
 * 4. Pega todo este código y presiona Enter
 */

(async function cancelMyRegistration() {
  console.log('🔄 Iniciando cancelación de registro...\n');

  const userId = 'BLC1d4Yd8JbQ7k5sXsnfWHTWztA3';
  const eventId = 'jca6PGwp7owwiIgior75';

  try {
    // Importar módulos necesarios
    const { collection, query, where, getDocs, doc, updateDoc, serverTimestamp, increment } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');

    // Usar la instancia de db del window si está disponible
    if (!window.db) {
      console.error('❌ Firebase no está inicializado. Asegúrate de estar en una página del sitio.');
      return;
    }

    const db = window.db;

    console.log(`🔍 Buscando registro para usuario ${userId} en evento ${eventId}...`);

    // Buscar el registro
    const q = query(
      collection(db, 'event_registrations'),
      where('userId', '==', userId),
      where('eventId', '==', eventId)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log('❌ No se encontró ningún registro');
      return;
    }

    const registrationDoc = querySnapshot.docs[0];
    const registrationData = registrationDoc.data();

    console.log(`📋 Registro encontrado (ID: ${registrationDoc.id})`);
    console.log(`   Estado actual: ${registrationData.status}`);
    console.log(`   Evento: ${registrationData.eventTitle}`);

    if (registrationData.status === 'cancelled') {
      console.log('⚠️  El registro ya está cancelado');
      console.log('✅ Puedes registrarte nuevamente');
      return;
    }

    // Cancelar el registro
    console.log('\n🔄 Cancelando registro...');
    await updateDoc(doc(db, 'event_registrations', registrationDoc.id), {
      status: 'cancelled',
      cancellationDate: serverTimestamp(),
      cancellationReason: 'Registro incompleto - reintentando',
      updatedAt: serverTimestamp()
    });

    console.log('✅ Registro cancelado exitosamente');

    // Decrementar contador de participantes (si es necesario)
    try {
      console.log('🔄 Actualizando contador de participantes...');
      const eventRef = doc(db, 'academic_events', eventId);
      await updateDoc(eventRef, {
        currentParticipants: increment(-1),
        updatedAt: serverTimestamp()
      });
      console.log('✅ Contador actualizado');
    } catch (updateError) {
      console.warn('⚠️  No se pudo actualizar el contador (puede que ya esté en 0)');
    }

    console.log('\n✨ ¡Listo! Recarga la página y podrás registrarte nuevamente\n');

    // Recargar página después de 2 segundos
    console.log('🔄 Recargando página en 2 segundos...');
    setTimeout(() => {
      window.location.reload();
    }, 2000);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
})();
