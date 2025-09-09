# 🔐 Sistema RBAC (Role-Based Access Control)

## **Descripción**
Sistema de control de acceso basado en roles que permite gestionar permisos granulares en el panel administrativo de Reino Da Mata.

## **Roles Disponibles**

### **Super Administrador** 🔴
- **Nivel**: 100
- **Permisos**: Acceso completo a todas las funcionalidades
- **Uso**: Propietarios del sitio, administradores principales

### **Gestor de Contenido** 🔵
- **Nivel**: 80
- **Permisos**: Gestión completa de artículos, newsletter y métricas básicas
- **Uso**: Editores, redactores, gestores de contenido

### **Gestor de Suscriptores** 🟢
- **Nivel**: 60
- **Permisos**: Gestión de suscriptores, métricas de sincronización
- **Uso**: Especialistas en marketing, gestores de comunidad

### **Analista** 🟣
- **Nivel**: 40
- **Permisos**: Acceso completo a métricas y análisis, lectura de contenido
- **Uso**: Analistas, consultores, reportes

### **Solo Lectura** ⚪
- **Nivel**: 20
- **Permisos**: Acceso de lectura a información básica
- **Uso**: Consultores externos, usuarios temporales

## **Instalación y Configuración**

### **1. Migración desde Sistema Anterior**
```javascript
// En la consola del navegador (página /admin/roles)
await checkMigrationStatus();  // Verificar estado
await migrateAdminRoles();     // Migrar administradores
```

### **2. Asignar Roles Manualmente**
```typescript
import { RBACService, AdminRole } from '@/features/admin/roles';

// Asignar rol
await RBACService.assignRole(
  'usuario@ejemplo.com',
  AdminRole.CONTENT_MANAGER,
  'admin@ejemplo.com'
);
```

### **3. Verificar Permisos**
```typescript
import { useRBAC, Permission } from '@/features/admin';

const MyComponent = () => {
  const rbac = useRBAC();
  
  if (!rbac.hasPermission(Permission.ARTICLES_WRITE)) {
    return <div>Sin permisos</div>;
  }
  
  return <div>Contenido protegido</div>;
};
```

## **Uso en Componentes**

### **Hook useRBAC**
```typescript
import { useRBAC } from '@/features/admin';

const MyComponent = () => {
  const {
    // Estado
    userRole,
    roleDefinition,
    loading,
    error,
    
    // Verificaciones
    hasPermission,
    canReadArticles,
    canWriteArticles,
    canManageUsers,
    
    // Utilidades
    isSuper 
    refresh
  } = useRBAC();
  
  return (
    <div>
      {canWriteArticles && <button>Crear Artículo</button>}
    </div>
  );
};
```

### **AdminProtection Mejorado**
```typescript
import AdminProtection from '@/components/AdminProtection';
import { Permission, AdminRole } from '@/features/admin/roles/types';

// Protección por permisos
<AdminProtection requiredPermissions={[Permission.ARTICLES_WRITE]}>
  <ArticleEditor />
</AdminProtection>

// Protección por roles
<AdminProtection allowedRoles={[AdminRole.SUPER_ADMIN, AdminRole.CONTENT_MANAGER]}>
  <ContentManagement />
</AdminProtection>

// Mostrar información del rol
<AdminProtection showRoleInfo={true}>
  <Dashboard />
</AdminProtection>
```

## **Permisos Disponibles**

### **Artículos**
- `ARTICLES_READ` - Leer artículos
- `ARTICLES_WRITE` - Crear/editar artículos
- `ARTICLES_DELETE` - Eliminar artículos
- `ARTICLES_PUBLISH` - Publicar artículos

### **Suscriptores**
- `SUBSCRIBERS_READ` - Ver suscriptores
- `SUBSCRIBERS_WRITE` - Gestionar suscriptores
- `SUBSCRIBERS_DELETE` - Eliminar suscriptores
- `SUBSCRIBERS_EXPORT` - Exportar datos

### **Newsletter**
- `NEWSLETTER_READ` - Ver newsletters
- `NEWSLETTER_SEND` - Enviar newsletters
- `NEWSLETTER_SCHEDULE` - Programar envíos

### **Sistema**
- `METRICS_READ` - Ver métricas
- `SETTINGS_READ/WRITE` - Configuración
- `USERS_MANAGE` - Gestionar usuarios
- `ROLES_MANAGE` - Gestionar roles
- `AUDIT_READ` - Ver auditoría
- `SYSTEM_ADMIN` - Administración del sistema

## **Gestión de Roles**

### **Página de Gestión**
Accede a `/admin/roles` para:
- Ver todos los usuarios con roles
- Asignar nuevos roles
- Modificar roles existentes
- Revocar roles
- Configurar fechas de expiración

### **API del Servicio**
```typescript
import RBACService from '@/features/admin/roles/rbacService';

// Obtener rol de usuario
const userRole = await RBACService.getUserRole('email@ejemplo.com');

// Verificar permiso específico
const hasPermission = await RBACService.hasPermission('email@ejemplo.com', Permission.ARTICLES_WRITE);

// Asignar rol con expiración
await RBACService.assignRole(
  'email@ejemplo.com', 
  AdminRole.CONTENT_MANAGER,
  'asignado-por@ejemplo.com',
  new Date('2024-12-31') // Opcional: fecha de expiración
);

// Actualizar rol
await RBACService.updateRole('email@ejemplo.com', {
  role: AdminRole.ANALYTICS_VIEWER
}, 'actualizado-por@ejemplo.com');

// Revocar rol
await RBACService.revokeRole('email@ejemplo.com', 'revocado-por@ejemplo.com');
```

## **Jerarquía de Roles**

Los roles superiores incluyen automáticamente los permisos de roles inferiores:

```
Super Admin (100)
    ├── Content Manager (80)
    ├── Subscriber Manager (60)
    ├── Analytics Viewer (40)
    └── Read Only (20)
```

## **Seguridad**

### **Características de Seguridad**
- ✅ Cache con TTL (5 minutos)
- ✅ Fallback al sistema anterior
- ✅ Validación de jerarquía de roles
- ✅ Auditoría de cambios (próximamente)
- ✅ Expiración de roles
- ✅ Verificación en tiempo real

### **Mejores Prácticas**
1. **Principio de menor privilegio**: Asignar solo los permisos necesarios
2. **Rotación de roles**: Revisar y actualizar roles regularmente
3. **Roles temporales**: Usar fechas de expiración para roles temporales
4. **Monitoreo**: Revisar logs de acceso regularmente

## **Migración y Compatibilidad**

### **Migración Automática**
El sistema migra automáticamente administradores del sistema anterior:
- Admins en `config.admin.emails` → `SUPER_ADMIN`
- Compatibilidad total con sistema anterior
- No requiere cambios en código existente

### **Rollback**
Para volver al sistema anterior temporalmente:
```typescript
// En AdminProtection, el sistema usará fallback automáticamente si RBAC falla
```

## **Troubleshooting**

### **Problemas Comunes**

**🔴 Error: "No tienes permisos"**
- Verificar que el usuario tenga rol asignado
- Ejecutar migración si es necesario
- Verificar que el rol tenga los permisos requeridos

**🔴 Error: "Tiempo de verificación agotado"**
- Verificar conexión a Firebase
- Revisar configuración de Firestore
- Refrescar página o limpiar cache

**🔴 Dashboard vacío**
- Usuario puede tener rol con permisos limitados
- Verificar permisos específicos del rol
- Asignar rol más amplio si es necesario

### **Comandos de Diagnóstico**
```javascript
// En consola del navegador
await checkMigrationStatus();     // Estado de migración
await migrateAdminRoles();        // Migrar admins
window.rbacDiagnostic = true;     // Activar logs detallados
```

## **Desarrollo**

### **Añadir Nuevos Permisos**
1. Añadir en `Permission` enum
2. Asignar a roles en `ROLE_DEFINITIONS`
3. Usar en componentes con `rbac.hasPermission()`

### **Crear Nuevos Roles**
1. Añadir en `AdminRole` enum
2. Definir en `ROLE_DEFINITIONS`
3. Configurar jerarquía en `ROLE_HIERARCHY`

### **Testing**
```bash
npm run test -- rbac
```

## **Próximas Mejoras**

- 🔄 Sistema de auditoría completo
- 🔄 Autenticación de dos factores (2FA)
- 🔄 Restricciones por IP/horario
- 🔄 Roles temporales automáticos
- 🔄 Integración con sistemas externos
- 🔄 Dashboard de analytics de seguridad