// Declaraciones globales para bibliotecas externas

declare global {
  interface Window {
    marked?: {
      parse: (content: string) => string;
    };
    DOMPurify?: {
      sanitize: (html: string) => string;
    };
    Chart?: any;
    articleServices?: {
      getAllArticles: (options?: any) => Promise<any[]>;
      getAllDrafts: () => Promise<any[]>;
      deleteArticle: (id: string) => Promise<void>;
      deleteDraft: (id: string) => Promise<void>;
      publishDraftAsArticle: (id: string) => Promise<void>;
      getArticleById: (id: string) => Promise<any>;
      updateArticle: (id: string, data: any) => Promise<void>;
      checkSlugExists: (slug: string) => Promise<boolean>;
    };
    eventServices?: {
      getUpcomingEvents: (limit?: number) => Promise<any[]>;
      getAllEvents: () => Promise<any[]>;
      getEventById: (id: string) => Promise<any>;
      createEvent: (data: any) => Promise<string>;
      updateEvent: (id: string, data: any) => Promise<void>;
      deleteEvent: (id: string) => Promise<void>;
    };
    firebaseConfig?: {
      auth: any;
      onAuthStateChanged: any;
    };
  }
}

// Extensiones de tipos para elementos HTML con propiedades comunes
declare global {
  interface HTMLElement {
    value?: string;
    disabled?: boolean;
    href?: string;
    src?: string;
  }
  
  interface HTMLFormElement {
    reset(): void;
  }
}

export {}; 