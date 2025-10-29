/**
 * Script para crear el evento de Tranca Rua en Firestore
 * Ejecutar con: node scripts/create-tranca-rua-event.js
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';

// Configuración de Firebase (producción)
const firebaseConfig = {
  apiKey: "AIzaSyBBSC2bs2u5JKoCQZZG9f6GNY04Pz1rqzQ",
  authDomain: "reino-da-mata-2fea3.firebaseapp.com",
  projectId: "reino-da-mata-2fea3",
  storageBucket: "reino-da-mata-2fea3.firebasestorage.app",
  messagingSenderId: "589086313796",
  appId: "1:589086313796:web:8ce84f30cf45f0ae4da1be",
  measurementId: "G-YKDHH0VY37"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function createTrancaRuaEvent() {
  try {
    console.log('🔮 Creando evento de Tranca Rua...');

    // Datos del evento
    const eventData = {
      // Información básica
      title: 'Ceremonia de Tranca Rua - Despedida del Mes de las Almas',
      description: 'DICEN QUE EL ALMA NO MUERE, DICEN QUE REGRESA AL UNIVERSO... En el centro umbandista Reino Da Mata estaremos despidiendo este acontecimiento. Lindo acontecimiento. Ceremonia especial dedicada a Tranca Rua, guardián de los caminos y protector de las encrucijadas. Una noche para honrar las almas que regresan al universo y fortalecer nuestra conexión espiritual.',
      shortDescription: 'Ceremonia especial de Tranca Rua para despedir el mes de las almas',
      type: 'ceremony',

      // Fecha y hora
      date: Timestamp.fromDate(new Date('2025-11-01T21:00:00')), // 1 de noviembre, 21:00
      endDate: Timestamp.fromDate(new Date('2025-11-02T00:00:00')), // Aproximadamente 3 horas
      duration: 3, // horas

      // Ubicación
      location: 'José María Delgado 1935 - Entre Avenida Italia y Taboba',
      isOnline: false,
      meetingLink: null,

      // Registro y participantes
      registrationRequired: false,
      maxParticipants: 50,
      currentParticipants: 0,
      registrationDeadline: Timestamp.fromDate(new Date('2025-11-01T12:00:00')),

      // Detalles
      speakers: ['Sacerdotes del Centro Umbandista Reino Da Mata'],
      topics: ['Tranca Rua', 'Exu', 'Guardianes de los caminos', 'Mes de las almas', 'Rituales umbandistas'],
      materials: [],

      // Imagen
      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/reino-da-mata-2fea3.firebasestorage.app/o/invitacion_tranca_rua.png?alt=media&token=33323717-46bb-437c-bc0a-61318fc994a4',

      // Precio
      isFree: true,
      price: null,
      currency: 'UYU',
      requiresSubscription: false,
      allowedSubscriptionTiers: [],

      // Estado
      status: 'published',
      featured: true,
      isActive: true,

      // Metadata
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    // Crear el evento en Firestore
    const docRef = await addDoc(collection(db, 'events'), eventData);

    console.log('✅ Evento creado exitosamente!');
    console.log('📋 ID del evento:', docRef.id);
    console.log('📅 Fecha:', new Date('2025-11-01T21:00:00').toLocaleString('es-UY'));
    console.log('📍 Ubicación:', eventData.location);
    console.log('🎫 Entrada gratuita');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al crear el evento:', error);
    process.exit(1);
  }
}

// Ejecutar
createTrancaRuaEvent();
