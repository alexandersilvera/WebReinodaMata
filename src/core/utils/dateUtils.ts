/**
 * Utilidades para formateo de fechas
 */

/**
 * Formatea una fecha al formato español corto
 * @example formatDate(new Date('2024-08-15')) -> "15 de agosto de 2024"
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-UY', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

/**
 * Formatea una fecha con hora
 * @example formatDateTime(new Date('2024-08-15T14:30')) -> "15 de agosto de 2024, 14:30"
 */
export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('es-UY', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Formatea solo la hora
 * @example formatTime(new Date('2024-08-15T14:30')) -> "14:30"
 */
export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('es-UY', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Formatea fecha corta (sin año si es el año actual)
 * @example formatShortDate(new Date('2024-08-15')) -> "15 de agosto"
 */
export function formatShortDate(date: Date): string {
  const now = new Date();
  const isCurrentYear = date.getFullYear() === now.getFullYear();

  if (isCurrentYear) {
    return new Intl.DateTimeFormat('es-UY', {
      day: 'numeric',
      month: 'long',
    }).format(date);
  }

  return formatDate(date);
}

/**
 * Formatea un rango de fechas
 * @example formatDateRange(date1, date2) -> "15 de agosto - 20 de agosto de 2024"
 */
export function formatDateRange(startDate: Date, endDate: Date): string {
  const sameYear = startDate.getFullYear() === endDate.getFullYear();
  const sameMonth =
    sameYear && startDate.getMonth() === endDate.getMonth();

  if (sameMonth) {
    return `${startDate.getDate()} - ${endDate.getDate()} de ${new Intl.DateTimeFormat('es-UY', { month: 'long', year: 'numeric' }).format(endDate)}`;
  }

  if (sameYear) {
    return `${new Intl.DateTimeFormat('es-UY', { day: 'numeric', month: 'long' }).format(startDate)} - ${formatDate(endDate)}`;
  }

  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

/**
 * Calcula tiempo relativo desde ahora
 * @example getRelativeTime(date) -> "en 3 días" | "hace 2 horas"
 */
export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffDays > 0) {
    return diffDays === 1 ? 'mañana' : `en ${diffDays} días`;
  } else if (diffDays < 0) {
    const absDays = Math.abs(diffDays);
    return absDays === 1 ? 'ayer' : `hace ${absDays} días`;
  } else if (diffHours > 0) {
    return diffHours === 1 ? 'en 1 hora' : `en ${diffHours} horas`;
  } else if (diffHours < 0) {
    const absHours = Math.abs(diffHours);
    return absHours === 1 ? 'hace 1 hora' : `hace ${absHours} horas`;
  } else if (diffMinutes > 0) {
    return diffMinutes === 1 ? 'en 1 minuto' : `en ${diffMinutes} minutos`;
  } else if (diffMinutes < 0) {
    const absMinutes = Math.abs(diffMinutes);
    return absMinutes === 1 ? 'hace 1 minuto' : `hace ${absMinutes} minutos`;
  }

  return 'ahora';
}

/**
 * Verifica si una fecha es hoy
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Verifica si una fecha es en el futuro
 */
export function isFutureDate(date: Date): boolean {
  return date > new Date();
}

/**
 * Verifica si una fecha está dentro de un rango de días desde ahora
 */
export function isWithinDays(date: Date, days: number): boolean {
  const now = new Date();
  const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  return date >= now && date <= futureDate;
}
