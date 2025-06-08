import { db } from "@/core/firebase/config"; // Assuming this is the correct path to your Firebase config
import { doc, setDoc, getDoc, serverTimestamp, Timestamp } from "firebase/firestore";

export interface SiteSettings {
  siteTitle?: string;
  siteDescription?: string;
  contactEmail?: string;
  metaKeywords?: string;
  googleAnalytics?: string;
  enableSitemap?: boolean;
  enableComments?: boolean;
  moderateComments?: boolean;
  requireLogin?: boolean;
  enableNewsletter?: boolean;
  newsletterFrequency?: 'weekly' | 'biweekly' | 'monthly';
  welcomeEmail?: string;
  updatedAt?: Timestamp; // Firestore Timestamp for updates
}

const SETTINGS_DOC_PATH = "settings/general"; // Path to the settings document

/**
 * Carga la configuración del sitio desde Firestore.
 * @returns Una promesa que resuelve a SiteSettings | null.
 */
export async function loadSettings(): Promise<SiteSettings | null> {
  try {
    const docRef = doc(db, SETTINGS_DOC_PATH);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as SiteSettings;
    } else {
      console.log("No se encontró el documento de configuración, se devolverán valores por defecto o nulos.");
      return null; // O podrías devolver un objeto SiteSettings con valores por defecto
    }
  } catch (error) {
    console.error("Error al cargar la configuración del sitio:", error);
    throw new Error("No se pudo cargar la configuración del sitio."); // Re-lanzar para que la página lo maneje
  }
}

/**
 * Guarda la configuración del sitio en Firestore.
 * @param settings Un objeto parcial de SiteSettings con los campos a actualizar.
 * @returns Una promesa que resuelve cuando la operación se completa.
 */
export async function saveSettings(settings: Partial<SiteSettings>): Promise<void> {
  try {
    const docRef = doc(db, SETTINGS_DOC_PATH);
    // Añadir/actualizar el campo updatedAt con el timestamp del servidor
    const settingsToSave = {
      ...settings,
      updatedAt: serverTimestamp(),
    };
    await setDoc(docRef, settingsToSave, { merge: true });
  } catch (error) {
    console.error("Error al guardar la configuración del sitio:", error);
    throw new Error("No se pudo guardar la configuración del sitio."); // Re-lanzar para que la página lo maneje
  }
}
