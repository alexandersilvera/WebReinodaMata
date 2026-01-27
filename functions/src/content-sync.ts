import { onSchedule } from "firebase-functions/v2/scheduler";
import { onCall } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as fs from "fs";
import * as path from "path";
import { mkdirp } from "mkdirp";
import slugify_module from "slugify";
const slugify = (slugify_module as any).default || slugify_module;


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
  const articlesSnapshot = await admin.firestore().collection('articles')
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

  // 1. Listar Archivos Existentes
  let existingMdFiles: string[] = [];
  try {
    existingMdFiles = fs.readdirSync(contentDir).filter(file => file.endsWith('.md'));
    console.log('Archivos Markdown existentes en el directorio:', existingMdFiles);
  } catch (error) {
    console.error('Error al leer el directorio de contenido:', error);
    // Si no podemos leer el directorio, es mejor no continuar para evitar eliminaciones accidentales.
    // O, podríamos optar por continuar solo con la sincronización y omitir la eliminación.
    // Por ahora, lanzaremos el error para detener la ejecución si el directorio no es legible.
    throw new Error('No se pudo leer el directorio de contenido para la sincronización.');
  }

  // 2. Rastrear Archivos Sincronizados
  const generatedFileNames = new Set<string>();

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
    generatedFileNames.add(fileName); // Añadir a la lista de archivos generados
  }

  // 3. Eliminar Archivos Huérfanos
  console.log('Verificando archivos Markdown obsoletos...');
  for (const orphanFileName of existingMdFiles) {
    if (!generatedFileNames.has(orphanFileName)) {
      const orphanFilePath = path.join(contentDir, orphanFileName);
      try {
        fs.unlinkSync(orphanFilePath);
        console.log(`Archivo Markdown obsoleto eliminado: ${orphanFileName}`);
      } catch (error) {
        console.error(`Error al eliminar archivo Markdown obsoleto ${orphanFileName}:`, error);
      }
    }
  }

  console.log('Sincronización completada y limpieza de archivos obsoletos finalizada.');
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