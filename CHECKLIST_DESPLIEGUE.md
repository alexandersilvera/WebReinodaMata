# 🚀 Checklist de Despliegue Seguro - WebReinodaMata

## ✅ Pre-despliegue: Verificaciones de Seguridad

### 🔒 Variables de Entorno
- [ ] Verificar que `.env` no está en el repositorio
- [ ] Confirmar que `.env.example` tiene variables de ejemplo (no reales)
- [ ] Validar que todas las variables requeridas están en `.env.local`
- [ ] Verificar configuración de Firebase Functions parameters

### 🔐 Credenciales
- [ ] Confirmar que no hay API keys hardcodeadas en el código
- [ ] Verificar que emails de admin no están hardcodeados
- [ ] Validar que credenciales de Mailgun usan parameters de Firebase
- [ ] Revisar que no hay tokens o passwords en el código

### 🛡️ Firebase Security
- [ ] Verificar Firebase Security Rules
- [ ] Confirmar configuración de autenticación
- [ ] Validar permisos de Firestore
- [ ] Revisar configuración de Storage (si aplica)

## 🔧 Configuración de Firebase Functions

### 1. Configurar Parameters de Mailgun
```bash
# API Key de Mailgun (OBLIGATORIO)
firebase functions:config:set mailgun_api_key="key-TU_API_KEY_REAL"

# Dominio de Mailgun
firebase functions:config:set mailgun_domain="mg.centroumbandistareinodamata.org"

# Email de origen
firebase functions:config:set mailgun_from_email="noreply@centroumbandistareinodamata.org"

# Nombre del remitente
firebase functions:config:set mailgun_from_name="Centro Umbandista Reino Da Mata"
```

### 2. Configurar Administradores
```bash
# Emails de administradores (separados por comas)
firebase functions:config:set admin_emails="admin@centroumbandistareinodamata.org,administrador@centroumbandistareinodamata.org"
```

### 3. Configurar CORS
```bash
# Dominios permitidos para CORS
firebase functions:config:set allowed_origins="https://centroumbandistareinodamata.org,https://reino-da-mata-2fea3.web.app,https://reino-da-mata-2fea3.firebaseapp.com"
```

### 4. Verificar Configuración
```bash
# Ver todas las configuraciones
firebase functions:config:get

# Verificar proyecto activo
firebase projects:list
firebase use --add
```

## 🌐 Variables de Entorno para Producción

### Crear `.env.local` para producción:
```env
# Firebase Configuration (USAR VALORES REALES)
PUBLIC_FIREBASE_API_KEY=tu-api-key-real
PUBLIC_FIREBASE_AUTH_DOMAIN=reino-da-mata-2fea3.firebaseapp.com
PUBLIC_FIREBASE_PROJECT_ID=reino-da-mata-2fea3
PUBLIC_FIREBASE_STORAGE_BUCKET=reino-da-mata-2fea3.firebasestorage.app
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu-sender-id-real
PUBLIC_FIREBASE_APP_ID=tu-app-id-real

# Application Configuration
NODE_ENV=production
PUBLIC_SITE_URL=https://centroumbandistareinodamata.org

# Administradores (separados por comas)
ADMIN_EMAILS=admin@centroumbandistareinodamata.org,administrador@centroumbandistareinodamata.org

# CORS
ALLOWED_ORIGINS=https://centroumbandistareinodamata.org,https://reino-da-mata-2fea3.web.app
```

## 🚀 Proceso de Despliegue

### 1. Preparación
```bash
# Limpiar dependencias
rm -rf node_modules functions/node_modules
npm install
cd functions && npm install && cd ..

# Verificar TypeScript
npm run check

# Construir el proyecto
npm run build
```

### 2. Desplegar Functions
```bash
# Desplegar solo las functions
firebase deploy --only functions

# Verificar que las functions están funcionando
firebase functions:log
```

### 3. Desplegar Hosting
```bash
# Desplegar el sitio web
firebase deploy --only hosting

# O desplegar todo junto
firebase deploy
```

### 4. Verificaciones Post-despliegue
- [ ] Probar carga del sitio web
- [ ] Verificar autenticación de administrador
- [ ] Probar envío de newsletter de prueba
- [ ] Verificar suscripción de emails
- [ ] Revisar logs de Firebase Functions
- [ ] Validar métricas en Firebase Console

## 🔍 Testing en Producción

### 1. Funcionalidades Críticas
- [ ] **Suscripción de emails**: Probar con email real
- [ ] **Newsletter**: Enviar email de prueba
- [ ] **Autenticación admin**: Login y acceso a panel
- [ ] **Formularios**: Verificar envío correcto
- [ ] **Navegación**: Probar todas las páginas

### 2. Rendimiento
- [ ] **Lighthouse Score**: >90 en todas las métricas
- [ ] **Core Web Vitals**: LCP <2.5s, FID <100ms, CLS <0.1
- [ ] **Carga inicial**: <3 segundos
- [ ] **Imágenes**: Optimizadas y responsive

### 3. SEO
- [ ] **Meta tags**: Título, descripción, Open Graph
- [ ] **Sitemap**: Generado y accesible
- [ ] **Robots.txt**: Configurado correctamente
- [ ] **Schema.org**: Structured data implementado

## 🚨 Monitoreo Post-lanzamiento

### 1. Logs y Errores
```bash
# Ver logs en tiempo real
firebase functions:log --follow

# Ver logs específicos
firebase functions:log --only sendNewsletterToSubscribers
```

### 2. Métricas a Revisar
- [ ] **Firebase Analytics**: Usuarios activos, páginas vistas
- [ ] **Firebase Performance**: Tiempos de carga, errores de red
- [ ] **Functions Metrics**: Invocaciones, errores, duración
- [ ] **Firestore Usage**: Lecturas, escrituras, almacenamiento

### 3. Alertas Configuradas
- [ ] **Error Rate**: >5% en Functions
- [ ] **Response Time**: >30s en Functions
- [ ] **Storage Usage**: >80% del límite
- [ ] **Database Usage**: >80% del límite

## 🔒 Configuración de Dominio (si aplica)

### 1. DNS Configuration
```
# Agregar registros DNS
A    @    151.101.1.195
A    @    151.101.65.195
AAAA @    2a04:4e42::645
AAAA @    2a04:4e42:200::645

# CNAME para www
CNAME www centroumbandistareinodamata.org
```

### 2. SSL Certificate
- [ ] Verificar que Firebase maneja SSL automáticamente
- [ ] Confirmar redirección HTTPS
- [ ] Probar certificado válido

## 📞 Contactos de Emergencia

- **Firebase Console**: https://console.firebase.google.com
- **Mailgun Dashboard**: https://app.mailgun.com
- **Documentación**: Revisar `SECURITY_SETUP.md`

## ✅ Sign-off Final

- [ ] **Developer**: Código revisado y testeado
- [ ] **Security**: Checklist de seguridad completado
- [ ] **Performance**: Métricas aceptables
- [ ] **Functionality**: Todas las funciones operativas
- [ ] **Monitoring**: Alertas configuradas

---

**Fecha de Despliegue**: ___________  
**Versión**: ___________  
**Desarrollador**: ___________  
**Aprobado por**: ___________

> 🚀 **¡Listo para producción!** Una vez completado este checklist, el sitio estará seguro y optimizado para el lanzamiento. 