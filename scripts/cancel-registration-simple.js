/**
 * Script simplificado para ejecutar en la consola del navegador
 *
 * INSTRUCCIONES:
 * 1. Ve a la página del evento: https://www.centroumbandistareinodamata.org/eventos/jca6PGwp7owwiIgior75
 * 2. Asegúrate de estar autenticado (logged in)
 * 3. Abre la consola del navegador (F12 → pestaña Console)
 * 4. Copia y pega este código completo
 * 5. Presiona Enter
 */

(async function() {
  const userId = 'BLC1d4Yd8JbQ7k5sXsnfWHTWztA3';
  const eventId = 'jca6PGwp7owwiIgior75';

  try {
    console.log('🔄 Buscando tu registro...');

    // Usar las funciones de Firebase que ya están cargadas
    const { collection, query, where, getDocs, doc, updateDoc, serverTimestamp, increment } =
      await import('firebase/firestore');

    // Importar db desde el config
    const { db } = await import('/src/core/firebase/config.ts');

    // Buscar el registro
    const q = query(
      collection(db, 'event_registrations'),
      where('userId', '==', userId),
      where('eventId', '==', eventId)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log('❌ No se encontró registro');
      return;
    }

    const regDoc = snapshot.docs[0];
    const regData = regDoc.data();

    console.log('📋 Registro encontrado:', regDoc.id);
    console.log('   Estado:', regData.status);

    if (regData.status === 'cancelled') {
      console.log('✅ Ya está cancelado. Puedes registrarte de nuevo.');
      return;
    }

    // Cancelar
    console.log('🔄 Cancelando...');
    await updateDoc(doc(db, 'event_registrations', regDoc.id), {
      status: 'cancelled',
      cancellationDate: serverTimestamp(),
      cancellationReason: 'Registro incompleto',
      updatedAt: serverTimestamp()
    });

    console.log('✅ Cancelado!');

    // Decrementar contador
    try {
      await updateDoc(doc(db, 'academic_events', eventId), {
        currentParticipants: increment(-1),
        updatedAt: serverTimestamp()
      });
      console.log('✅ Contador actualizado');
    } catch (e) {
      console.warn('⚠️  Contador no actualizado');
    }

    console.log('\n✨ ¡Listo! Recarga la página (F5) y regístrate de nuevo\n');

  } catch (error) {
    console.error('❌ Error:', error);
  }
})();
