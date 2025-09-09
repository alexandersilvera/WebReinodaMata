/**
 * Tipos y definiciones para el sistema de roles y permisos
 */

export enum AdminRole {
  SUPER_ADMIN = 'super_admin',
  CONTENT_MANAGER = 'content_manager',
  SUBSCRIBER_MANAGER = 'subscriber_manager',
  ANALYTICS_VIEWER = 'analytics_viewer',
  READONLY = 'readonly'
}

export enum Permission {
  // Artículos
  ARTICLES_READ = 'articles:read',
  ARTICLES_WRITE = 'articles:write',
  ARTICLES_DELETE = 'articles:delete',
  ARTICLES_PUBLISH = 'articles:publish',
  
  // Suscriptores
  SUBSCRIBERS_READ = 'subscribers:read',
  SUBSCRIBERS_WRITE = 'subscribers:write',
  SUBSCRIBERS_DELETE = 'subscribers:delete',
  SUBSCRIBERS_EXPORT = 'subscribers:export',
  
  // Newsletter
  NEWSLETTER_READ = 'newsletter:read',
  NEWSLETTER_SEND = 'newsletter:send',
  NEWSLETTER_SCHEDULE = 'newsletter:schedule',
  
  // Métricas y Analytics
  METRICS_READ = 'metrics:read',
  ANALYTICS_READ = 'analytics:read',
  SYNC_MONITOR = 'sync:monitor',
  
  // Sistema y Configuración
  SETTINGS_READ = 'settings:read',
  SETTINGS_WRITE = 'settings:write',
  USERS_MANAGE = 'users:manage',
  ROLES_MANAGE = 'roles:manage',
  
  // Auditoría
  AUDIT_READ = 'audit:read',
  SYSTEM_ADMIN = 'system:admin'
}

export interface RoleDefinition {
  role: AdminRole;
  name: string;
  description: string;
  permissions: Permission[];
  color: string;
  level: number; // Para jerarquía
}

export interface UserRole {
  email: string;
  role: AdminRole;
  assignedBy: string;
  assignedAt: Date;
  isActive: boolean;
  expiresAt?: Date; // Para roles temporales
  restrictions?: {
    ipWhitelist?: string[];
    timeRestrictions?: {
      allowedHours: { start: number; end: number };
      allowedDays: number[]; // 0-6 (domingo-sábado)
    };
  };
}

export interface PermissionCheck {
  permission: Permission;
  resource?: string;
  resourceId?: string;
}

export interface RolePermissions {
  [key: string]: {
    allowed: Permission[];
    denied?: Permission[];
  };
}

// Definiciones de roles predeterminadas
export const ROLE_DEFINITIONS: Record<AdminRole, RoleDefinition> = {
  [AdminRole.SUPER_ADMIN]: {
    role: AdminRole.SUPER_ADMIN,
    name: 'Super Administrador',
    description: 'Acceso completo a todas las funcionalidades',
    permissions: Object.values(Permission),
    color: 'red',
    level: 100
  },
  
  [AdminRole.CONTENT_MANAGER]: {
    role: AdminRole.CONTENT_MANAGER,
    name: 'Gestor de Contenido',
    description: 'Gestión completa de artículos y newsletter',
    permissions: [
      Permission.ARTICLES_READ,
      Permission.ARTICLES_WRITE,
      Permission.ARTICLES_DELETE,
      Permission.ARTICLES_PUBLISH,
      Permission.NEWSLETTER_READ,
      Permission.NEWSLETTER_SEND,
      Permission.NEWSLETTER_SCHEDULE,
      Permission.METRICS_READ,
      Permission.ANALYTICS_READ
    ],
    color: 'blue',
    level: 80
  },
  
  [AdminRole.SUBSCRIBER_MANAGER]: {
    role: AdminRole.SUBSCRIBER_MANAGER,
    name: 'Gestor de Suscriptores',
    description: 'Gestión de suscriptores y métricas básicas',
    permissions: [
      Permission.SUBSCRIBERS_READ,
      Permission.SUBSCRIBERS_WRITE,
      Permission.SUBSCRIBERS_DELETE,
      Permission.SUBSCRIBERS_EXPORT,
      Permission.METRICS_READ,
      Permission.SYNC_MONITOR
    ],
    color: 'green',
    level: 60
  },
  
  [AdminRole.ANALYTICS_VIEWER]: {
    role: AdminRole.ANALYTICS_VIEWER,
    name: 'Analista',
    description: 'Acceso completo a métricas y análisis',
    permissions: [
      Permission.METRICS_READ,
      Permission.ANALYTICS_READ,
      Permission.SYNC_MONITOR,
      Permission.AUDIT_READ,
      Permission.ARTICLES_READ,
      Permission.SUBSCRIBERS_READ
    ],
    color: 'purple',
    level: 40
  },
  
  [AdminRole.READONLY]: {
    role: AdminRole.READONLY,
    name: 'Solo Lectura',
    description: 'Acceso de solo lectura a información básica',
    permissions: [
      Permission.METRICS_READ,
      Permission.ARTICLES_READ,
      Permission.SUBSCRIBERS_READ
    ],
    color: 'gray',
    level: 20
  }
};

export type RoleHierarchy = {
  [K in AdminRole]: AdminRole[];
};

// Jerarquía de roles (un rol superior puede realizar acciones de roles inferiores)
export const ROLE_HIERARCHY: RoleHierarchy = {
  [AdminRole.SUPER_ADMIN]: [
    AdminRole.CONTENT_MANAGER,
    AdminRole.SUBSCRIBER_MANAGER,
    AdminRole.ANALYTICS_VIEWER,
    AdminRole.READONLY
  ],
  [AdminRole.CONTENT_MANAGER]: [AdminRole.READONLY],
  [AdminRole.SUBSCRIBER_MANAGER]: [AdminRole.READONLY],
  [AdminRole.ANALYTICS_VIEWER]: [AdminRole.READONLY],
  [AdminRole.READONLY]: []
};