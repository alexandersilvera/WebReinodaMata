/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import admin from "firebase-admin";

// Inicializar la aplicación de Firebase Admin
admin.initializeApp();
export const db = admin.firestore(); // Exportar la instancia de Firestore

// Exportar funciones básicas (newsletter, suscripciones, métricas)
import { sendNewsletterToSubscribers, sendArticleNewsletter, sendSubscriptionConfirmation, sendTestNewsletter, cleanupInactiveSubscribers, recordPageView, cleanupOldPageViews, subscribeEmail, processFailedSyncs, syncUserProfileToSubscribers, sendWorkshopInvitation } from "./basic.js";
export { sendNewsletterToSubscribers, sendArticleNewsletter, sendSubscriptionConfirmation, sendTestNewsletter, cleanupInactiveSubscribers, recordPageView, cleanupOldPageViews, subscribeEmail, processFailedSyncs, syncUserProfileToSubscribers, sendWorkshopInvitation };

// Exportar funciones de pagos
import { createPaymentPreference } from "./features/payments/createPaymentPreference.js";
import { mercadoPagoWebhook } from "./features/payments/mercadoPagoWebhook.js";
export { createPaymentPreference, mercadoPagoWebhook };

// Exportar funciones de IA (TEMPORALMENTE DESHABILITADO - falta GEMINI_API_KEY)
// export * from "./features/ai/chat";

// Exportar funciones de eventos
import { cancelEventRegistration, sendEventRegistrationConfirmation } from "./features/events/index.js";
export { cancelEventRegistration, sendEventRegistrationConfirmation };

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
