/**
 * Utilidad para exponer servicios globales en window object
 * para páginas de administración que los necesitan
 */

import { auth, onAuthStateChanged } from '@/core/firebase/config';
import * as articleService from '@/services/articleService';

export const exposeGlobalServices = () => {
  // Exponer servicios de Firebase
  if (typeof window !== 'undefined') {
    window.firebaseConfig = {
      auth,
      onAuthStateChanged
    };
    
    // Exponer servicios de artículos
    window.articleServices = {
      // Wrapper para getAllArticles que incluye drafts por defecto en admin
      getAllArticles: (options = {}) => {
        return articleService.getAllArticles({
          includeDrafts: true,  // Por defecto incluir borradores en admin
          ...options
        });
      },
      getAllDrafts: articleService.getAllDrafts,
      deleteArticle: articleService.deleteArticle,
      deleteDraft: articleService.deleteDraft,
      publishDraftAsArticle: articleService.publishDraftAsArticle,
      getArticleById: articleService.getArticleById,
      updateArticle: articleService.updateArticle,
      checkSlugExists: articleService.checkSlugExists
    };
    
    console.log('[GlobalServices] Servicios expuestos globalmente');
  }
};

// Ejecutar automáticamente cuando se importe el módulo
exposeGlobalServices();

export default {
  exposeGlobalServices
};