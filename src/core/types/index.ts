// Definiciones de tipos para la aplicación

// Tipo para artículos
export interface Article {
  id: string;
  title: string;
  slug: string;
  description: string;
  pubDate: string;
  updatedDate?: string;
  heroImage?: string;
  content: string;
  tags: string[];
  draft?: boolean;
  featured?: boolean;
  views?: number;
}

// Tipo para suscriptores
export interface Subscriber {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
  active: boolean;
  unsubscribeToken?: string;
}

// Tipo para comentarios
export interface Comment {
  id: string;
  articleId: string;
  author: {
    id: string;
    name: string;
    email: string;
    photoURL?: string;
  };
  content: string;
  createdAt: string;
  updatedAt?: string;
  likes: number;
  parentId?: string;
  replies?: Comment[];
}

// Tipo para usuarios
export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  isAdmin: boolean;
  createdAt: string;
} 