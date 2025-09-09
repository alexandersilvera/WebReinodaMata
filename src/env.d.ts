/// <reference types="astro/client" />

declare global {
  interface Window {
    firebaseConfig?: {
      auth?: any;
      functions?: any;
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
  }
}