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

// Exportar funciones básicas
export * from "./basic";

// Exportar funciones de sincronización de contenido
export * from "./content-sync";

// Exportar funciones de migración
export * from "./migration";

console.log("Funciones cargadas correctamente");

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
