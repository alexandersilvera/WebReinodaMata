/// <reference types="astro/client" />

declare global {
  interface Window {
    firebaseConfig?: {
      auth?: any;
      functions?: any;
      onAuthStateChanged?: any;
    };
    articleServices?: {
      getAllArticles?: any;
      getAllDrafts?: any;
      deleteArticle?: any;
      deleteDraft?: any;
      publishDraftAsArticle?: any;
      getArticleById?: any;
      updateArticle?: any;
      checkSlugExists?: any;
    };
    // Funciones globales para artículos
    deleteItem?: (id: any, type: any, title: any) => void;
    publishDraft?: (id: any) => void;
  }
}