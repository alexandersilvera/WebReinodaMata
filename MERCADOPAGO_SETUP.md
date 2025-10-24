# Configuración de Mercado Pago

Esta guía detalla cómo configurar Mercado Pago para procesar pagos de suscripciones, donaciones y registros a eventos.

## Requisitos Previos

- Cuenta de Mercado Pago (Uruguay)
- Verificación de identidad completada
- Acceso al panel de desarrolladores de Mercado Pago
- Firebase CLI instalado y configurado
- Proyecto Firebase con Functions habilitadas

## Paso 1: Obtener el Access Token

### 1.1 Crear Aplicación en Mercado Pago

1. Inicia sesión en [Mercado Pago](https://www.mercadopago.com.uy/)
2. Ve a **Tus integraciones** → **Credenciales**
3. Selecciona **Credenciales de producción** o **Credenciales de prueba** (para desarrollo)
4. Copia el **Access Token**

**Importante**:
- Para desarrollo usa el **Access Token de prueba**
- Para producción usa el **Access Token de producción**
- Nunca compartas tu Access Token públicamente

### 1.2 Verificar Tu Cuenta

Mercado Pago enviará un código de verificación a tu correo electrónico. Debes:
1. Revisar tu correo (puede tardar algunas horas)
2. Ingresar el código en el panel de Mercado Pago
3. Una vez verificado, tu Access Token estará activo

## Paso 2: Configurar Firebase Functions

### 2.1 Configurar Access Token

Desde la raíz del proyecto, ejecuta:

```bash
# Para desarrollo (Access Token de prueba)
firebase functions:config:set mercadopago.access_token="TU_ACCESS_TOKEN_DE_PRUEBA"

# Para producción (Access Token real)
firebase functions:config:set mercadopago.access_token="TU_ACCESS_TOKEN_DE_PRODUCCION"
```

### 2.2 Configurar URL de la Aplicación

```bash
# Para desarrollo local
firebase functions:config:set app.url="http://localhost:4321"

# Para producción en Vercel
firebase functions:config:set app.url="https://tu-dominio.vercel.app"
```

### 2.3 Verificar Configuración

```bash
firebase functions:config:get
```

Deberías ver:

```json
{
  "mercadopago": {
    "access_token": "TU_ACCESS_TOKEN"
  },
  "app": {
    "url": "https://tu-dominio.vercel.app"
  }
}
```

### 2.4 Descargar Configuración Local (Desarrollo)

Para desarrollo local con emulators:

```bash
cd functions
firebase functions:config:get > .runtimeconfig.json
```

**Importante**: Asegúrate de que `.runtimeconfig.json` esté en `.gitignore`

## Paso 3: Desplegar Cloud Functions

### 3.1 Build de Functions

```bash
cd functions
npm run build
```

### 3.2 Deploy a Firebase

```bash
# Desplegar todas las funciones
npm run deploy

# O desplegar solo funciones de pagos
firebase deploy --only functions:createPaymentPreference,functions:mercadoPagoWebhook
```

### 3.3 Verificar Deployment

Después del deploy, Firebase mostrará las URLs de tus funciones:

```
✔  functions[createPaymentPreference(us-central1)] https://us-central1-TU_PROYECTO.cloudfunctions.net/createPaymentPreference
✔  functions[mercadoPagoWebhook(us-central1)] https://us-central1-TU_PROYECTO.cloudfunctions.net/mercadoPagoWebhook
```

**Copia la URL del webhook**, la necesitarás en el siguiente paso.

## Paso 4: Configurar Webhook en Mercado Pago

### 4.1 Configurar URL del Webhook

1. Ve al [panel de desarrolladores de Mercado Pago](https://www.mercadopago.com.uy/developers/panel)
2. Selecciona tu aplicación
3. Ve a **Webhooks** → **Configurar notificaciones**
4. Selecciona **Modo Producción** o **Modo Sandbox** (según tu Access Token)
5. En **URL de notificaciones**, ingresa:
   ```
   https://us-central1-TU_PROYECTO.cloudfunctions.net/mercadoPagoWebhook
   ```
6. Selecciona los eventos a notificar:
   - ✅ Pagos
   - ✅ Contracargos
   - ✅ Devoluciones
7. Guarda la configuración

### 4.2 Verificar Webhook

Mercado Pago enviará una notificación de prueba. Verifica en los logs de Firebase:

```bash
firebase functions:log --only mercadoPagoWebhook
```

Deberías ver:
```
🔔 Mercado Pago Webhook received: { ... }
```

## Paso 5: Testing

### 5.1 Modo Sandbox (Desarrollo)

Para probar en modo desarrollo:

1. Usa el **Access Token de prueba**
2. Usa tarjetas de prueba de Mercado Pago:
   - **Aprobado**: `4509 9535 6623 3704`
   - **Rechazado**: `4013 5406 8274 6260`
   - **Pendiente**: `3711 803032 57522`
   - CVV: `123`
   - Fecha: Cualquier fecha futura

### 5.2 Probar Flujo de Pago

1. Inicia sesión en la aplicación
2. Ve a `/planes`
3. Selecciona un plan
4. Completa el checkout
5. Serás redirigido a Mercado Pago
6. Usa una tarjeta de prueba
7. Verás la página de confirmación
8. Verifica en Firebase Console que se creó:
   - Documento en `payments`
   - Documento en `subscriptions`
   - Documento en `payment_preferences`

### 5.3 Verificar Logs

```bash
# Ver todos los logs de funciones
firebase functions:log

# Ver solo logs de webhook
firebase functions:log --only mercadoPagoWebhook

# Ver solo logs de creación de preferencias
firebase functions:log --only createPaymentPreference
```

## Paso 6: Producción

### 6.1 Cambiar a Credenciales de Producción

Cuando estés listo para producción:

1. Obtén el **Access Token de producción** de Mercado Pago
2. Actualiza la configuración:
   ```bash
   firebase functions:config:set mercadopago.access_token="TU_ACCESS_TOKEN_DE_PRODUCCION"
   firebase functions:config:set app.url="https://tu-dominio-real.com"
   ```
3. Redeploy functions:
   ```bash
   cd functions
   npm run deploy
   ```
4. Actualiza el webhook en Mercado Pago con la URL de producción

### 6.2 Verificar Variables de Entorno

Asegúrate de que Vercel tenga las variables de entorno correctas:

```
PUBLIC_FIREBASE_API_KEY=...
PUBLIC_FIREBASE_AUTH_DOMAIN=...
PUBLIC_FIREBASE_PROJECT_ID=...
PUBLIC_FIREBASE_STORAGE_BUCKET=...
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
PUBLIC_FIREBASE_APP_ID=...
PUBLIC_FIREBASE_MEASUREMENT_ID=...
PUBLIC_APP_URL=https://tu-dominio-real.com
```

## Troubleshooting

### Error: "Configuration error"

**Causa**: Access Token no configurado en Firebase Functions.

**Solución**:
```bash
firebase functions:config:set mercadopago.access_token="TU_TOKEN"
firebase deploy --only functions
```

### Error: "Missing or insufficient permissions"

**Causa**: Firestore rules no permiten escribir en `payments` o `subscriptions`.

**Solución**: Verifica que las reglas en `firestore.rules` permitan escritura desde Cloud Functions (con `request.auth == null` para admin operations).

### Webhook no recibe notificaciones

**Causas posibles**:
1. URL del webhook incorrecta en Mercado Pago
2. Function no desplegada
3. CORS bloqueando la petición

**Solución**:
1. Verifica la URL en el panel de Mercado Pago
2. Redeploy: `firebase deploy --only functions:mercadoPagoWebhook`
3. Verifica logs: `firebase functions:log --only mercadoPagoWebhook`

### Pagos no se procesan

**Causa**: Metadata incorrecta en la preferencia.

**Solución**: Verifica logs de `createPaymentPreference`:
```bash
firebase functions:log --only createPaymentPreference
```

Busca el log:
```
Creating preference with data: { ... }
```

Verifica que `metadata` contenga:
- `paymentType`
- `userId` (para subscriptions)
- `planId` (para subscriptions)
- `billingPeriod` (para subscriptions)

## Recursos

- [Documentación de Mercado Pago](https://www.mercadopago.com.uy/developers/es/docs)
- [Tarjetas de prueba](https://www.mercadopago.com.uy/developers/es/docs/testing/test-cards)
- [Webhooks de Mercado Pago](https://www.mercadopago.com.uy/developers/es/docs/webhooks)
- [Firebase Functions Configuration](https://firebase.google.com/docs/functions/config-env)

## Seguridad

### Mejores Prácticas

1. **Nunca expongas tu Access Token**: No lo incluyas en código cliente ni en repositorios
2. **Usa HTTPS**: Siempre usa HTTPS en producción
3. **Valida webhooks**: Verifica que las notificaciones vengan de Mercado Pago
4. **Logging**: Mantén logs de todas las transacciones
5. **Manejo de errores**: Captura y registra todos los errores
6. **Testing**: Siempre prueba en sandbox antes de producción

### Validación de Webhooks (Opcional)

Para mayor seguridad, puedes validar que los webhooks vengan realmente de Mercado Pago:

```typescript
// En mercadoPagoWebhook.ts
const signature = req.headers['x-signature'];
const requestId = req.headers['x-request-id'];

// Validar firma según documentación de Mercado Pago
// https://www.mercadopago.com.uy/developers/es/docs/webhooks/additional-info/signatures
```

## Contacto y Soporte

Si encuentras problemas:
1. Revisa los logs de Firebase Functions
2. Verifica la configuración en Mercado Pago
3. Consulta la documentación oficial
4. Contacta al soporte de Mercado Pago para problemas específicos de la plataforma
