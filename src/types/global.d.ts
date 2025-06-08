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