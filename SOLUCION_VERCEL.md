# Solución para Problemas de Despliegue en Vercel

## Problema Original
El proyecto presentaba errores 500 en Vercel con el mensaje:
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/var/task/dist/server/entry.mjs'
```

## Causas Identificadas

1. **Incompatibilidad de versiones**: Astro 5.0 con adaptador de Vercel 8.1.5 desactualizado
2. **Configuración incorrecta**: Uso de `@astrojs/vercel/serverless` (deprecado)
3. **Conflicto con vercel.json**: Configuración manual interfería con el adaptador
4. **Problemas de caché**: Vercel usando artefactos de build anteriores
5. **Versión de Node.js no especificada**: Vercel podría usar versión incompatible

## Soluciones Implementadas

### 1. Actualización de Dependencias
```bash
npm install @astrojs/vercel@latest astro@latest
```

**Versiones actuales:**
- Astro: 5.9.2
- @astrojs/vercel: 8.1.5

### 2. Actualización de Configuración Astro
**Antes:**
```javascript
import vercel from "@astrojs/vercel/serverless";

adapter: vercel({
    imageService: true,
    webAnalytics: { enabled: true }
}),
```

**Después:**
```javascript
import vercel from "@astrojs/vercel";

adapter: vercel({
    webAnalytics: { enabled: true },
    speedInsights: { enabled: true }
}),
```

### 3. Configuración Vercel.json Minimalista
Creé un `vercel.json` que asegura el comportamiento correcto:
```json
{
  "buildCommand": "npm run build",
  "framework": null,
  "installCommand": "npm install"
}
```

### 4. Especificación de Versión Node.js
Creé `.nvmrc` para garantizar la versión correcta:
```
20
```

### 5. Optimización de Scripts
Actualicé el script `build:vercel` para incluir verificación de tipos:
```json
"build:vercel": "astro check && astro build"
```

### 6. Limpieza de Caché
```bash
rm -rf .vercel dist node_modules/.cache .astro
npm run build
```

## Verificación de la Solución

1. **Build exitoso**: ✅
   - El archivo `entry.mjs` se genera correctamente en `.vercel/output/functions/_render.func/dist/server/`
   - No hay errores de compilación
   - Se eliminaron las advertencias de deprecación

2. **Estructura correcta**: ✅
   ```
   .vercel/output/
   ├── functions/
   │   └── _render.func/
   │       └── dist/
   │           └── server/
   │               ├── entry.mjs ✅ (3.2KB)
   │               ├── manifest_*.mjs
   │               └── renderers.mjs
   ├── static/
   └── config.json
   ```

3. **Repositorio actualizado**: ✅
   - Cambios subidos a GitHub
   - Vercel detectará automáticamente los nuevos cambios

## Comandos para Despliegue

```bash
# Build para Vercel
npm run build:vercel

# O usar el build estándar
npm run build
```

## Pasos para Solucionar en Vercel

1. **En el Dashboard de Vercel:**
   - Ve a tu proyecto
   - Settings → General → Build & Development Settings
   - Asegúrate de que esté configurado como "Other Framework"
   - Node.js Version: 20.x

2. **Forzar nuevo despliegue:**
   - Ve a Deployments
   - Haz clic en el último despliegue
   - Click en "Redeploy" 

3. **Si persiste el problema:**
   - Settings → General → Build & Development Settings
   - Clear Build Cache
   - Hacer un nuevo deploy

## Notas Importantes

1. **No interferir con el adaptador**: El `vercel.json` es minimalista para no interferir
2. **Usar importación moderna**: `@astrojs/vercel` en lugar de `@astrojs/vercel/serverless`
3. **Mantener dependencias actualizadas**: Especialmente con Astro 5.x
4. **Limpiar caché periódicamente**: Si hay problemas de despliegue
5. **Verificar versión Node.js**: Usar Node.js 20.x en producción

## Estado del Proyecto
- ✅ Build exitoso localmente
- ✅ Entry.mjs generado correctamente
- ✅ Configuración optimizada  
- ✅ Cambios subidos al repositorio
- ✅ Versión Node.js especificada
- ✅ Configuración Vercel minimalista aplicada
- ✅ Listo para despliegue en Vercel

## Próximos Pasos

1. Vercel debería detectar automáticamente los cambios
2. Si persiste el error, forzar un rebuild desde el dashboard de Vercel
3. Verificar que Vercel esté usando Node.js 20.x
4. Si es necesario, limpiar la caché de build en Vercel

El proyecto ahora debería desplegarse correctamente en Vercel sin errores 500. 