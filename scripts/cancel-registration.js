/**
 * Script de administración para cancelar un registro de evento
 * Uso: node scripts/cancel-registration.js <userId> <eventId>
 */

import admin from 'firebase-admin';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Inicializar Firebase Admin
if (!admin.apps.length) {
  const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    join(__dirname, '../serviceAccountKey.json');

  try {
    const serviceAccount = await import(serviceAccountPath, { assert: { type: 'json' } });

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount.default)
    });

    console.log('✅ Firebase Admin inicializado correctamente');
  } catch (error) {
    console.error('❌ Error al inicializar Firebase Admin:', error.message);
    console.log('\nAsegúrate de tener el archivo serviceAccountKey.json en la raíz del proyecto');
    console.log('o configura la variable GOOGLE_APPLICATION_CREDENTIALS');
    process.exit(1);
  }
}

const db = admin.firestore();

async function cancelRegistration(userId, eventId) {
  try {
    console.log(`\n🔍 Buscando registro para usuario ${userId} en evento ${eventId}...`);

    // Buscar el registro
    const snapshot = await db.collection('event_registrations')
      .where('userId', '==', userId)
      .where('eventId', '==', eventId)
      .get();

    if (snapshot.empty) {
      console.log('❌ No se encontró ningún registro para este usuario y evento');
      return false;
    }

    const registrationDoc = snapshot.docs[0];
    const registrationData = registrationDoc.data();

    console.log(`📋 Registro encontrado (ID: ${registrationDoc.id})`);
    console.log(`   Estado actual: ${registrationData.status}`);
    console.log(`   Evento: ${registrationData.eventTitle}`);
    console.log(`   Usuario: ${registrationData.userName} (${registrationData.userEmail})`);

    if (registrationData.status === 'cancelled') {
      console.log('⚠️  El registro ya está cancelado');
      return true;
    }

    // Cancelar el registro
    console.log('\n🔄 Cancelando registro...');
    await registrationDoc.ref.update({
      status: 'cancelled',
      cancellationDate: admin.firestore.FieldValue.serverTimestamp(),
      cancellationReason: 'Cancelado por administrador - Registro incompleto',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('✅ Registro cancelado exitosamente');

    // Decrementar contador de participantes
    console.log('🔄 Decrementando contador de participantes...');
    const eventRef = db.collection('academic_events').doc(eventId);
    await eventRef.update({
      currentParticipants: admin.firestore.FieldValue.increment(-1),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('✅ Contador de participantes actualizado');
    console.log('\n✨ ¡Listo! Ahora puedes registrarte nuevamente al evento\n');

    return true;
  } catch (error) {
    console.error('❌ Error al cancelar registro:', error.message);
    return false;
  }
}

// Ejecutar el script
const userId = process.argv[2];
const eventId = process.argv[3];

if (!userId || !eventId) {
  console.log(`
📝 Uso: node scripts/cancel-registration.js <userId> <eventId>

Ejemplo:
  node scripts/cancel-registration.js BLC1d4Yd8JbQ7k5sXsnfWHTWztA3 jca6PGwp7owwiIgior75
  `);
  process.exit(1);
}

cancelRegistration(userId, eventId)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
