# 🔐 Configuración de Administradores - Reino Da Mata

## 📧 **Administradores Configurados**

### 👨‍💼 **Administrador Principal**
- **Email**: `alexandersilvera@hotmail.com`
- **Rol**: Super administrador
- **Permisos**: Acceso completo al sistema

### 🛡️ **Administradores Secundarios**
- `admin@centroumbandistareinodamata.org` - Admin genérico del sitio
- `administrador@centroumbandistareinodamata.org` - Admin alternativo

---

## ⚙️ **Configuración de Variables de Entorno**

### 🖥️ **Para Desarrollo Local**

Crear archivo `.env.local`:
```env
PUBLIC_ADMIN_EMAILS=alexandersilvera@hotmail.com,admin@centroumbandistareinodamata.org
PUBLIC_SITE_URL=http://localhost:4321
MAIN_ADMIN_EMAIL=alexandersilvera@hotmail.com
```

### 🚀 **Para Producción (Vercel)**

En el panel de Vercel, configurar estas variables:

```env
PUBLIC_ADMIN_EMAILS=alexandersilvera@hotmail.com,admin@centroumbandistareinodamata.org,administrador@centroumbandistareinodamata.org
PUBLIC_SITE_URL=https://www.centroumbandistareinodamata.org
MAIN_ADMIN_EMAIL=alexandersilvera@hotmail.com
NODE_ENV=production
```

---

## 🔒 **Medidas de Seguridad Implementadas**

### ✅ **Configuración Multi-Capa**
1. **Variables de entorno**: Configuración principal
2. **Firestore Rules**: Validación en base de datos
3. **Frontend**: Protección de rutas
4. **Fallbacks**: Múltiples niveles de respaldo

### ✅ **Validaciones de Seguridad**
- ✅ Emails validados con regex
- ✅ Normalización automática (lowercase)
- ✅ Protección contra acceso no autorizado
- ✅ Logging de intentos de acceso

### ✅ **Separación de Entornos**
- 🔸 **Desarrollo**: Solo emails necesarios
- 🔸 **Producción**: Lista completa de administradores
- 🔸 **Testing**: Configuración aislada

---

## 🚨 **Procedimientos de Emergencia**

### 📞 **Si Pierdes Acceso de Administrador**

1. **Verifica tu email en Firebase Auth**:
   - Debe ser exactamente: `alexandersilvera@hotmail.com`
   - No debe tener espacios o caracteres extra

2. **Verifica variables de entorno**:
   ```bash
   # En desarrollo
   echo $PUBLIC_ADMIN_EMAILS
   
   # Debe mostrar: alexandersilvera@hotmail.com,...
   ```

3. **Fallback de emergencia**:
   - El sistema tiene fallbacks hardcodeados con tu email
   - Si falla todo, el código tiene tu email como administrador

### 🔧 **Restaurar Configuración**

Si algo falla, restaurar desde los archivos de configuración:

```bash
# Copiar configuración de ejemplo
cp .env.production .env.local

# O restaurar desde variables documentadas
export PUBLIC_ADMIN_EMAILS="alexandersilvera@hotmail.com,admin@centroumbandistareinodamata.org"
```

---

## 📋 **Lista de Verificación de Seguridad**

### ✅ **Antes de Desplegar**
- [ ] Verificar que `alexandersilvera@hotmail.com` está en `PUBLIC_ADMIN_EMAILS`
- [ ] Confirmar que es el primer email en la lista (administrador principal)
- [ ] Probar acceso al panel `/admin` en desarrollo
- [ ] Verificar que las reglas de Firestore están desplegadas
- [ ] Confirmar variables de entorno en Vercel

### ✅ **Después de Desplegar**
- [ ] Probar login con `alexandersilvera@hotmail.com`
- [ ] Verificar acceso a todas las secciones del admin
- [ ] Confirmar que otros emails no autorizados son rechazados
- [ ] Verificar logs de seguridad en Firebase Console

---

## 🔄 **Cómo Agregar/Quitar Administradores**

### ➕ **Agregar Nuevo Administrador**

1. **Actualizar variable de entorno**:
   ```env
   PUBLIC_ADMIN_EMAILS=alexandersilvera@hotmail.com,nuevo@ejemplo.com,admin@centroumbandistareinodamata.org
   ```

2. **Actualizar Firestore Rules** (opcional para futuro):
   ```javascript
   return [
     'alexandersilvera@hotmail.com',
     'nuevo@ejemplo.com',
     'admin@centroumbandistareinodamata.org'
   ];
   ```

3. **Desplegar cambios**:
   ```bash
   # Desarrollo: reiniciar servidor
   npm run dev
   
   # Producción: redeploy en Vercel
   ```

### ➖ **Quitar Administrador**

1. Simplemente remover del `PUBLIC_ADMIN_EMAILS`
2. Los cambios toman efecto inmediatamente
3. El usuario ya no tendrá acceso al panel admin

---

## 🔗 **Enlaces Importantes**

- **Panel Admin**: `/admin`
- **Configuración Admin**: `/admin/admin-config-simple`
- **Firebase Console**: https://console.firebase.google.com/project/reino-da-mata-2fea3
- **Vercel Dashboard**: https://vercel.com/dashboard

---

## 📞 **Contacto de Emergencia**

Si tienes problemas con el acceso de administrador:

1. **Verifica autenticación en Firebase Auth**
2. **Revisa variables de entorno en Vercel**
3. **Consulta logs de Firebase Functions**
4. **Restaura desde archivos de configuración documentados**

---

**🔐 Última actualización**: $(date)
**✅ Estado**: Configuración activa y funcional