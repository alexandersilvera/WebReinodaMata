/**
 * Sistema de validación centralizado para el frontend
 * Proporciona funciones seguras de validación de datos
 */

/**
 * Resultado de validación
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitized?: string;
}

/**
 * Valida formato de email
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email es requerido' };
  }

  const sanitized = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(sanitized)) {
    return { isValid: false, error: 'Formato de email inválido' };
  }

  if (sanitized.length > 254) {
    return { isValid: false, error: 'Email demasiado largo' };
  }

  return { isValid: true, sanitized };
}

/**
 * Valida contraseña segura
 */
export function validatePassword(password: string): ValidationResult {
  if (!password || typeof password !== 'string') {
    return { isValid: false, error: 'Contraseña es requerida' };
  }

  if (password.length < 6) {
    return { isValid: false, error: 'La contraseña debe tener al menos 6 caracteres' };
  }

  if (password.length > 128) {
    return { isValid: false, error: 'La contraseña es demasiado larga' };
  }

  // Verificar caracteres peligrosos
  const dangerousChars = /[<>'"&]/;
  if (dangerousChars.test(password)) {
    return { isValid: false, error: 'La contraseña contiene caracteres no permitidos' };
  }

  return { isValid: true, sanitized: password };
}

/**
 * Valida texto general (nombres, títulos, etc.)
 */
export function validateText(text: string, minLength: number = 1, maxLength: number = 255): ValidationResult {
  if (!text || typeof text !== 'string') {
    return { isValid: false, error: 'Texto es requerido' };
  }

  const sanitized = text.trim();

  if (sanitized.length < minLength) {
    return { isValid: false, error: `Texto debe tener al menos ${minLength} caracteres` };
  }

  if (sanitized.length > maxLength) {
    return { isValid: false, error: `Texto no puede exceder ${maxLength} caracteres` };
  }

  // Remover caracteres peligrosos básicos
  const cleanText = sanitized.replace(/[<>]/g, '');

  return { isValid: true, sanitized: cleanText };
}

/**
 * Valida contenido HTML (para artículos)
 */
export function validateHtmlContent(html: string, maxLength: number = 50000): ValidationResult {
  if (!html || typeof html !== 'string') {
    return { isValid: false, error: 'Contenido es requerido' };
  }

  const sanitized = html.trim();

  if (sanitized.length === 0) {
    return { isValid: false, error: 'Contenido no puede estar vacío' };
  }

  if (sanitized.length > maxLength) {
    return { isValid: false, error: `Contenido no puede exceder ${maxLength} caracteres` };
  }

  // Verificar scripts maliciosos básicos
  const scriptRegex = /<script[^>]*>.*?<\/script>/gi;
  if (scriptRegex.test(sanitized)) {
    return { isValid: false, error: 'No se permiten scripts en el contenido' };
  }

  return { isValid: true, sanitized };
}

/**
 * Valida URL
 */
export function validateUrl(url: string): ValidationResult {
  if (!url || typeof url !== 'string') {
    return { isValid: false, error: 'URL es requerida' };
  }

  const sanitized = url.trim();

  try {
    const urlObj = new URL(sanitized);
    
    // Solo permitir protocolos seguros
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { isValid: false, error: 'Solo se permiten URLs HTTP/HTTPS' };
    }

    return { isValid: true, sanitized };
  } catch {
    return { isValid: false, error: 'Formato de URL inválido' };
  }
}

/**
 * Valida slug para URLs amigables
 */
export function validateSlug(slug: string): ValidationResult {
  if (!slug || typeof slug !== 'string') {
    return { isValid: false, error: 'Slug es requerido' };
  }

  const sanitized = slug.trim().toLowerCase();
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

  if (!slugRegex.test(sanitized)) {
    return { isValid: false, error: 'Slug solo puede contener letras, números y guiones' };
  }

  if (sanitized.length < 3) {
    return { isValid: false, error: 'Slug debe tener al menos 3 caracteres' };
  }

  if (sanitized.length > 100) {
    return { isValid: false, error: 'Slug no puede exceder 100 caracteres' };
  }

  return { isValid: true, sanitized };
}

/**
 * Escapa caracteres HTML para prevenir XSS
 */
export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Limpia texto de caracteres peligrosos
 */
export function sanitizeText(text: string): string {
  return text
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}

/**
 * Valida formulario de artículo completo
 */
export function validateArticleForm(data: {
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  author: string;
  featuredImage?: string;
}): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  const titleValidation = validateText(data.title, 5, 200);
  if (!titleValidation.isValid) {
    errors.title = titleValidation.error!;
  }

  const contentValidation = validateHtmlContent(data.content);
  if (!contentValidation.isValid) {
    errors.content = contentValidation.error!;
  }

  const excerptValidation = validateText(data.excerpt, 10, 500);
  if (!excerptValidation.isValid) {
    errors.excerpt = excerptValidation.error!;
  }

  const slugValidation = validateSlug(data.slug);
  if (!slugValidation.isValid) {
    errors.slug = slugValidation.error!;
  }

  const authorValidation = validateText(data.author, 2, 100);
  if (!authorValidation.isValid) {
    errors.author = authorValidation.error!;
  }

  if (data.featuredImage) {
    const imageValidation = validateUrl(data.featuredImage);
    if (!imageValidation.isValid) {
      errors.featuredImage = imageValidation.error!;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
} 