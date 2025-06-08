import { onCall } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as fs from "fs";
import * as path from "path";
import * as yaml from "yaml";
import { glob } from "glob";

// Asegurarnos de tener la app inicializada
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Función para migrar artículos existentes desde archivos markdown a Firestore
 * Esta función debe ejecutarse manualmente, solo una vez
 */
export const migrateMarkdownToFirestore = onCall(
  { memory: "512MiB" },
  async () => {
    try {
      // Ruta a los archivos markdown
      const contentDir = path.join(process.cwd(), '..', 'src', 'content', 'blog');
      
      // Obtener todos los archivos markdown
      const markdownFiles = await glob('*.md', { cwd: contentDir });
      
      console.log(`Encontrados ${markdownFiles.length} archivos markdown para migrar`);
      
      if (markdownFiles.length === 0) {
        return { success: true, message: "No hay archivos para migrar" };
      }
      
      // Artículos migrados exitosamente
      const migratedArticles: Array<{id: string, title: string, slug: string}> = [];
      
      // Procesar cada archivo
      for (const file of markdownFiles) {
        const filePath = path.join(contentDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Separar frontmatter del contenido
        const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
        
        if (!match) {
          console.warn(`Archivo ${file} no tiene formato frontmatter válido`);
          continue;
        }
        
        const [, frontmatterStr, articleContent] = match;
        
        try {
          // Parsear frontmatter
          const frontmatter = yaml.parse(frontmatterStr);
          
          // Extraer slug del nombre del archivo
          const slug = path.basename(file, '.md');
          
          // Convertir fecha a timestamp
          let publishDate;
          if (frontmatter.pubDate) {
            try {
              // Intentar convertir la fecha en diferentes formatos
              const dateStr = frontmatter.pubDate;
              
              // Formato "Mes DD, YYYY"
              const spanishMonths = [
                "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
              ];
              
              let parsedDate;
              
              // Intentar con formato español "Mes DD, YYYY"
              if (typeof dateStr === 'string') {
                const monthMatch = spanishMonths.findIndex(month => 
                  dateStr.includes(month));
                
                if (monthMatch !== -1) {
                  const parts = dateStr.replace(spanishMonths[monthMatch], '').trim().split(/[\s,]+/);
                  const day = parseInt(parts[0]);
                  const year = parseInt(parts[1]);
                  
                  if (!isNaN(day) && !isNaN(year)) {
                    parsedDate = new Date(year, monthMatch, day);
                  }
                }
              }
              
              // Si no se pudo parsear, intentar formato ISO o Date
              if (!parsedDate) {
                parsedDate = new Date(dateStr);
              }
              
              // Si la fecha es válida, convertirla a Timestamp
              if (!isNaN(parsedDate.getTime())) {
                publishDate = admin.firestore.Timestamp.fromDate(parsedDate);
              } else {
                publishDate = admin.firestore.Timestamp.now();
              }
            } catch (error) {
              console.warn(`Error al parsear fecha para ${file}: ${error}`);
              publishDate = admin.firestore.Timestamp.now();
            }
          } else {
            publishDate = admin.firestore.Timestamp.now();
          }
          
          // Preparar datos del artículo
          const articleData = {
            title: frontmatter.title || "Sin título",
            slug,
            content: articleContent.trim(),
            description: frontmatter.description || "",
            image: frontmatter.heroImage || "",
            author: frontmatter.author || "Centro Umbandista Reino Da Mata",
            tags: frontmatter.tags || [],
            draft: false,
            commentsEnabled: true,
            publishDate,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          };
          
          // Guardar en Firestore
          const articlesRef = db.collection("articles");
          const docRef = await articlesRef.add(articleData);
          
          migratedArticles.push({
            id: docRef.id,
            title: articleData.title,
            slug: articleData.slug
          });
          
          console.log(`Artículo migrado: ${file} -> ${docRef.id}`);
        } catch (error: any) {
          console.error(`Error al procesar archivo ${file}:`, error);
        }
      }
      
      return { 
        success: true, 
        message: `Migración completada. ${migratedArticles.length} artículos migrados.`,
        migratedArticles
      };
    } catch (error: any) {
      console.error('Error en migración:', error);
      return { success: false, error: error.message || "Error desconocido" };
    }
  }
); 