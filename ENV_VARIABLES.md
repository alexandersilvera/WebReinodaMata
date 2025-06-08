# Variables de Entorno - WebReinodaMata

Este documento explica todas las variables de entorno necesarias para configurar correctamente el proyecto WebReinodaMata.

## 🔒 Configuración de Seguridad

### Archivo .env.local

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
# ====================================================
# CONFIGURACIÓN GENERAL
# ====================================================

# Entorno de ejecución
NODE_ENV=development

# URL del sitio web (sin barra final)
PUBLIC_SITE_URL=http://localhost:4321

# ====================================================
# FIREBASE CONFIGURATION
# ====================================================

# Configuración pública de Firebase (seguro exponer)
PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
PUBLIC_FIREBASE_PROJECT_ID=your-project-id
PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

# URL de Measurement ID para Analytics (opcional)
PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# ====================================================
# ADMINISTRADORES
# ====================================================

# Lista de emails de administradores separados por comas
ADMIN_EMAILS=admin1@example.com,admin2@example.com

# Email principal del administrador para notificaciones
MAIN_ADMIN_EMAIL=admin@example.com

# ====================================================
# CONFIGURACIÓN DE CORS
# ====================================================

# Orígenes permitidos para CORS (separados por comas)
ALLOWED_ORIGINS=http://localhost:4321,https://your-domain.com
```

## 🔧 Configuración de Firebase Functions

Para las Firebase Functions, configura las variables sensibles usando Firebase CLI:

```bash
# Configuración de Mailgun
firebase functions:config:set mailgun.api_key="your-mailgun-api-key"
firebase functions:config:set mailgun.domain="your-mailgun-domain.com"
firebase functions:config:set mailgun.from_email="noreply@your-domain.com"
firebase functions:config:set mailgun.from_name="Centro Umbandista Reino Da Mata"

# Configuración de administradores (si necesitas override)
firebase functions:config:set admin.emails="admin1@example.com,admin2@example.com"
firebase functions:config:set admin.main_email="admin@example.com"

# Configuración de CORS para Functions
firebase functions:config:set cors.allowed_origins="http://localhost:4321,https://your-domain.com"
```

## 🌍 Configuración por Entorno

### Desarrollo (development)
```env
NODE_ENV=development
PUBLIC_SITE_URL=http://localhost:4321
ALLOWED_ORIGINS=http://localhost:4321
```

### Staging
```env
NODE_ENV=staging
PUBLIC_SITE_URL=https://staging-your-domain.com
ALLOWED_ORIGINS=https://staging-your-domain.com
```

### Producción (production)
```env
NODE_ENV=production
PUBLIC_SITE_URL=https://your-domain.com
ALLOWED_ORIGINS=https://your-domain.com
```

## 📋 Variables Requeridas vs Opcionales

### ✅ REQUERIDAS
- `PUBLIC_FIREBASE_API_KEY`
- `PUBLIC_FIREBASE_AUTH_DOMAIN`
- `PUBLIC_FIREBASE_PROJECT_ID`
- `PUBLIC_FIREBASE_STORAGE_BUCKET`
- `PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `PUBLIC_FIREBASE_APP_ID`
- `ADMIN_EMAILS`
- `MAIN_ADMIN_EMAIL`

### 🔶 OPCIONALES
- `PUBLIC_FIREBASE_MEASUREMENT_ID` (para Analytics)
- `GOOGLE_ANALYTICS_ID`
- `ALLOWED_ORIGINS` (tiene valores por defecto)
- `PUBLIC_SITE_URL` (tiene valores por defecto)

## 🛡️ Mejores Prácticas de Seguridad

1. **NUNCA** subas archivos `.env*` al repositorio
2. **Usa diferentes credenciales** para desarrollo, staging y producción
3. **Rota las claves** regularmente (cada 3-6 meses)
4. **Variables PUBLIC_**: Solo para datos que pueden ser públicos
5. **Variables sensibles**: Siempre en Firebase Functions Config
6. **HTTPS obligatorio** en producción
7. **Validación**: El sistema valida automáticamente las variables al iniciar

## 🔄 Comandos Útiles

```bash
# Ver configuración actual de Functions
firebase functions:config:get

# Verificar variables de entorno locales
npm run check-env

# Desplegar con nueva configuración
firebase deploy --only functions

# Verificar configuración en la app
npm run dev
```

## ⚠️ Problemas Comunes

### Error: "Missing required environment variables"
- Verifica que todas las variables requeridas estén en `.env.local`
- Asegúrate de reiniciar el servidor después de cambios

### Error: "Firebase initialization failed"
- Verifica las credenciales de Firebase
- Confirma que el proyecto ID sea correcto

### Error: "CORS blocked"
- Agrega tu dominio a `ALLOWED_ORIGINS`
- Verifica la configuración de Firebase Functions

### Error: "Mailgun sending failed"
- Confirma las credenciales de Mailgun en Firebase Functions Config
- Verifica que el dominio esté verificado en Mailgun

## 📞 Soporte

Si tienes problemas con la configuración:
1. Revisa los logs de la consola del navegador
2. Verifica los logs de Firebase Functions
3. Confirma que todas las variables estén configuradas
4. Consulta la documentación de `SECURITY_SETUP.md` 