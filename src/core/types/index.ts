// Definiciones de tipos para la aplicación

// Tipo para artículos (unificado y consolidado)
export interface Article {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  image: string;
  heroImage?: string; // Alias para compatibilidad
  author: string;
  tags: string[];
  draft: boolean;
  featured: boolean;
  commentsEnabled: boolean;
  views: number;
  pubDate: string; // Para compatibilidad con frontend (ISO string)
  publishDate?: any; // Timestamp para Firestore
  createdAt?: any; // Timestamp para Firestore
  updatedAt?: any; // Timestamp para Firestore
  updatedDate?: string; // Alias para compatibilidad
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