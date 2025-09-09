/// <reference types="astro/client" />

declare global {
  interface Window {
    firebaseConfig?: any;
    articleServices?: any;
  }
}