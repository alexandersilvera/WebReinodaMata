/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import * as admin from "firebase-admin";

// Inicializar la aplicación de Firebase Admin
admin.initializeApp();

// Exportar funciones básicas (newsletter, suscripciones, métricas)
export * from "./basic";

// Exportar funciones de pagos
export * from "./features/payments";

// Exportar funciones de IA (TEMPORALMENTE DESHABILITADO - falta GEMINI_API_KEY)
// export * from "./features/ai/chat";

// Exportar funciones de eventos
export * from "./features/events";

// DESHABILITADO: Funciones de sincronización de contenido (obsoletas)
// export * from "./content-sync";

// DESHABILITADO: Funciones de migración (obsoletas)
// export * from "./migration";

console.log("Funciones cargadas correctamente");

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
