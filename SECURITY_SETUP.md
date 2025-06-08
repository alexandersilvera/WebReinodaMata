# 🔒 Guía de Configuración de Seguridad

Esta guía te ayudará a configurar correctamente todas las variables de entorno y aspectos de seguridad del proyecto **Centro Umbandista Reino Da Mata**.

## 📋 Prerrequisitos

- Firebase CLI instalado (`npm install -g firebase-tools`)
- Cuenta de Mailgun configurada
- Acceso al proyecto de Firebase

## 🔧 Configuración de Variables de Entorno

### 1. Variables de Entorno de Astro (.env)

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```bash
# ====================================================
# FIREBASE CONFIGURATION
# ====================================================
PUBLIC_FIREBASE_API_KEY=tu-firebase-api-key
PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto-id
PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto.firebasestorage.app
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# ====================================================
# APPLICATION CONFIGURATION
# ====================================================
NODE_ENV=development
PUBLIC_SITE_URL=http://localhost:4321
ALLOWED_ORIGINS=http://localhost:4321,https://tu-dominio.com
```

### 2. Configuración de Firebase Functions

Las credenciales sensibles (como Mailgun) se configuran usando Firebase Functions parameters:

```bash
# Configurar API Key de Mailgun
firebase functions:config:set mailgun_api_key="key-tu-api-key-de-mailgun"

# Configurar dominio de Mailgun
firebase functions:config:set mailgun_domain="mg.tu-dominio.com"

# Configurar email de origen
firebase functions:config:set mailgun_from_email="noreply@tu-dominio.com"

# Configurar nombre de origen
firebase functions:config:set mailgun_from_name="Tu Nombre de Organización"

# Configurar orígenes permitidos para CORS
firebase functions:config:set allowed_origins="http://localhost:4321,https://tu-dominio.com"
```

### 3. Verificar Configuración

```bash
# Ver la configuración actual
firebase functions:config:get

# Debería mostrar algo como:
# {
#   "mailgun": {
#     "api_key": "key-xxxxxxxxx",
#     "domain": "mg.tu-dominio.com",
#     "from_email": "noreply@tu-dominio.com",
#     "from_name": "Tu Organización"
#   },
#   "allowed_origins": "http://localhost:4321,https://tu-dominio.com"
# }
```

## 🛡️ Configuración de Administradores

### Método Actual (Centralizado)

Los administradores se configuran en `src/core/config/index.ts`:

```typescript
admin: {
  emails: ['alexandersilvera@hotmail.com'], // Agregar más emails aquí
},
```

### Método Recomendado (Dinámico via Firestore)

Para mayor flexibilidad, puedes crear un documento en Firestore:

```javascript
// En Firebase Console, crear documento:
// Colección: settings
// Documento: admin
// Campos:
{
  emails: ["admin1@ejemplo.com", "admin2@ejemplo.com"],
  lastUpdated: "timestamp"
}
```

## 🔐 Configuración de Seguridad de Firestore

Las reglas de Firestore ya están configuradas en `firestore.rules`. Asegúrate de que:

1. Solo administradores pueden escribir artículos
2. Solo usuarios autenticados pueden comentar
3. Los datos sensibles están protegidos

### Verificar Reglas

```bash
# Desplegar reglas de Firestore
firebase deploy --only firestore:rules

# Probar reglas (opcional)
firebase emulators:start --only firestore
```

## 📧 Configuración de Mailgun

### 1. Obtener Credenciales

1. Ve a [Mailgun Dashboard](https://app.mailgun.com/)
2. Selecciona tu dominio
3. Copia el `API Key` y el `Domain`

### 2. Configurar DNS

Configura los registros DNS según las instrucciones de Mailgun:

```
TXT: v=spf1 include:mailgun.org ~all
CNAME: email.tu-dominio.com -> mailgun.org
MX: mxa.mailgun.org (priority 10)
MX: mxb.mailgun.org (priority 10)
```

### 3. Verificar Dominio

Espera que Mailgun verifique tu dominio antes de enviar emails.

## 🚀 Despliegue Seguro

### 1. Variables de Producción

Para producción, actualiza las variables:

```bash
# Actualizar para producción
firebase functions:config:set allowed_origins="https://tu-dominio-real.com"

# Actualizar URL del sitio en .env
PUBLIC_SITE_URL=https://tu-dominio-real.com
NODE_ENV=production
```

### 2. Desplegar Functions

```bash
# Desplegar solo las functions
firebase deploy --only functions

# O desplegar todo
firebase deploy
```

## ⚠️ Consideraciones de Seguridad

### ❌ NO Hacer

- **NO** subir el archivo `.env` al repositorio
- **NO** hardcodear credenciales en el código
- **NO** exponer API keys en el cliente
- **NO** permitir orígenes no confiables en CORS

### ✅ SÍ Hacer

- **SÍ** usar variables de entorno para credenciales
- **SÍ** validar inputs en las functions
- **SÍ** usar reglas de Firestore estrictas
- **SÍ** monitorear logs de errores
- **SÍ** rotar API keys regularmente

## 🔍 Monitoreo y Logs

### Ver Logs de Functions

```bash
# Ver logs en tiempo real
firebase functions:log

# Ver logs específicos
firebase functions:log --only sendNewsletterToSubscribers
```

### Configurar Alertas

1. Ve a Firebase Console
2. Functions → Logs
3. Configura alertas para errores

## 🧪 Testing de Seguridad

### 1. Probar Autenticación

```bash
# Probar login sin permisos
curl -X POST https://tu-proyecto.cloudfunctions.net/sendNewsletterToSubscribers

# Debería retornar error de autenticación
```

### 2. Probar CORS

```bash
# Probar desde origen no permitido
curl -H "Origin: https://malicious-site.com" \
     -X POST https://tu-proyecto.cloudfunctions.net/sendNewsletterToSubscribers

# Debería ser bloqueado
```

## 📞 Soporte

Si tienes problemas con la configuración:

1. Verifica los logs: `firebase functions:log`
2. Revisa las reglas de Firestore
3. Confirma que las variables estén configuradas: `firebase functions:config:get`
4. Verifica el estado de Mailgun en su dashboard

## 🔄 Checklist de Seguridad

- [ ] Variables de entorno configuradas correctamente
- [ ] API Key de Mailgun configurada en Firebase Functions
- [ ] CORS configurado con orígenes específicos
- [ ] Reglas de Firestore desplegadas
- [ ] Administradores configurados correctamente
- [ ] Mailgun verificado y funcionando
- [ ] Logs monitoreados
- [ ] `.env` añadido a `.gitignore`
- [ ] Tests de seguridad realizados

---

**⚠️ Importante**: Nunca compartas las credenciales de producción y siempre usa entornos separados para desarrollo y producción. 