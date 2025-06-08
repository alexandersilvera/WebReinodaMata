import { onSchedule } from "firebase-functions/v2/scheduler";
import { onCall } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as fs from "fs";
import * as path from "path";
import { mkdirp } from "mkdirp";
import slugify from "slugify";

// Asegurarnos de tener la app inicializada
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Función para sincronizar artículos de Firestore a archivos markdown
 * Se ejecuta automáticamente a las 3 AM todos los días
 */
export const syncContentToFilesScheduled = onSchedule(
  {
    schedule: "0 3 * * *", // Cron job: a las 3 AM todos los días
    timeZone: "America/Montevideo",
    memory: "512MiB",
  }, 
  async () => {
    try {
      await syncArticlesToFiles();
      console.log('Sincronización programada completada');
    } catch (error: any) {
      console.error('Error en sincronización programada:', error);
    }
  }
);

/**
 * Versión manual de la sincronización, puede ser invocada desde el panel de administración
 */
export const syncContentToFiles = onCall(
  { memory: "512MiB" }, 
  async () => {
    try {
      await syncArticlesToFiles();
      return { success: true, message: "Sincronización completada con éxito" };
    } catch (error: any) {
      console.error('Error en sincronización manual:', error);
      return { success: false, error: error.message || "Error desconocido" };
    }
  }
);

/**
 * Función principal de sincronización que obtiene artículos de Firestore
 * y los escribe como archivos markdown
 */
async function syncArticlesToFiles() {
  // Obtener artículos publicados de Firestore
  const articlesSnapshot = await db.collection('articles')
    .where('draft', '==', false)
    .get();
  
  console.log(`Encontrados ${articlesSnapshot.size} artículos para sincronizar`);
  
  if (articlesSnapshot.empty) {
    console.log('No hay artículos para sincronizar');
    return;
  }
  
  // Directorio de destino para los archivos markdown
  const contentDir = path.join(process.cwd(), '..', 'src', 'content', 'blog');
  
  // Asegurarse de que el directorio existe
  await mkdirp(contentDir);
  
  // Procesar cada artículo
  for (const doc of articlesSnapshot.docs) {
    const article = doc.data();
    
    // Generar nombre de archivo basado en el slug
    const fileName = `${article.slug || slugify(article.title, { lower: true })}.md`;
    const filePath = path.join(contentDir, fileName);
    
    // Crear el frontmatter en formato YAML
    const frontmatter = `---
title: "${article.title}"
pubDate: "${formatDate(article.publishDate)}"
heroImage: "${article.image || ''}"
description: "${article.description || ''}"
tags: [${article.tags.map((tag: string) => `"${tag}"`).join(', ')}]
---

${article.content}`;
    
    // Escribir el archivo
    fs.writeFileSync(filePath, frontmatter, 'utf8');
    console.log(`Artículo sincronizado: ${fileName}`);
  }
  
  console.log('Sincronización completada');
}

/**
 * Función auxiliar para formatear fechas
 */
function formatDate(timestamp: any) {
  if (!timestamp) return new Date().toISOString();
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  
  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
} 