# 🏛️ Centro Umbandista Reino Da Mata

Sitio web oficial del Centro Umbandista Reino Da Mata, construido con tecnologías modernas y un enfoque en la seguridad y el rendimiento.

## 📋 Documentación de Planificación

**Versión actual**: v1.0 | **Próxima versión**: v2.0 (en desarrollo)

- 📖 **[PLAN_RESUMEN.md](./PLAN_RESUMEN.md)** - Resumen ejecutivo del plan de mejoras
- 🗺️ **[ROADMAP_V2.md](./ROADMAP_V2.md)** - Roadmap completo v2.0 (5 fases, 6 meses)
- 🏃 **[SPRINT_PLAN.md](./SPRINT_PLAN.md)** - Plan de sprint (próximas 2 semanas)
- 🔧 **[TECHNICAL_DEBT.md](./TECHNICAL_DEBT.md)** - Deuda técnica y mejoras

👉 **Empieza aquí**: Lee `PLAN_RESUMEN.md` para un overview completo.

## 🛠️ Tecnologías

- **Frontend**: [Astro](https://astro.build/) + [React](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Backend**: [Firebase](https://firebase.google.com/) (Firestore, Auth, Functions)
- **Email**: [Mailgun](https://www.mailgun.com/)
- **Payments**: [Mercado Pago](https://www.mercadopago.com.uy/) (Uruguay)
- **Hosting**: Firebase Hosting + Vercel

## 🏗️ Estructura del Proyecto

```text
/
├── public/                 # Archivos estáticos
├── src/
│   ├── components/        # Componentes React/Astro
│   ├── core/             # Lógica central (config, firebase, hooks)
│   ├── features/         # Funcionalidades por módulos
│   ├── layouts/          # Layouts de página
│   └── pages/            # Páginas de Astro
├── functions/            # Firebase Functions
│   ├── src/
│   │   ├── config/       # Configuración segura
│   │   └── basic.ts      # Functions principales
├── docs/                 # Documentación
├── SECURITY_SETUP.md     # Guía de configuración de seguridad
└── ENV_VARIABLES.md      # Variables de entorno
```

## 🚀 Inicio Rápido

### 1. Prerrequisitos

- Node.js 18+
- npm o yarn
- Cuenta de Firebase
- Cuenta de Mailgun (para emails)
- Cuenta de Mercado Pago (para pagos) - **[Guía completa](./MERCADOPAGO_SETUP.md)**

### 2. Configuración

```bash
# Clonar el repositorio
git clone <repository-url>
cd WebReinodaMata

# Instalar dependencias
npm install

# Configurar variables de entorno
cp ENV_VARIABLES.md .env.local
# Edita .env.local con tus credenciales reales

# Configurar Firebase Functions
cd functions
npm install

# Configurar Mailgun
firebase functions:config:set mailgun.api_key="tu-api-key"
firebase functions:config:set mailgun.domain="tu-dominio.com"

# Configurar Mercado Pago (ver MERCADOPAGO_SETUP.md para detalles)
firebase functions:config:set mercadopago.access_token="tu-access-token"
firebase functions:config:set app.url="https://tu-dominio.com"

# Ver ENV_VARIABLES.md para más configuraciones
cd ..
```

### 3. Desarrollo

```bash
# Servidor de desarrollo
npm run dev

# En otra terminal - Emulador de Firebase
firebase emulators:start
```

## 🔒 Configuración de Seguridad

**⚠️ IMPORTANTE**: Este proyecto incluye un sistema de seguridad robusto. Antes de desplegar:

1. **Lee la documentación de seguridad**: [`SECURITY_SETUP.md`](./SECURITY_SETUP.md)
2. **Configura variables de entorno**: [`ENV_VARIABLES.md`](./ENV_VARIABLES.md)
3. **Verifica que no hay credenciales hardcodeadas**
4. **Configura Firebase Functions con credenciales seguras**

### Variables de Entorno Críticas

```env
# REQUERIDAS - Ver ENV_VARIABLES.md para detalles
PUBLIC_FIREBASE_API_KEY=
PUBLIC_FIREBASE_AUTH_DOMAIN=
PUBLIC_FIREBASE_PROJECT_ID=
ADMIN_EMAILS=
MAIN_ADMIN_EMAIL=
```

## 📋 Comandos Disponibles

| Comando                     | Descripción                                    |
| :------------------------- | :--------------------------------------------- |
| `npm install`              | Instala todas las dependencias                 |
| `npm run dev`              | Servidor de desarrollo en `localhost:4321`    |
| `npm run build`            | Construye para producción en `./dist/`        |
| `npm run preview`          | Preview local de la build de producción       |
| `npm run check`            | Verificaciones de TypeScript y linting        |
| `npm run check:types`      | Solo verificación de tipos TypeScript         |
| `firebase emulators:start` | Emuladores de Firebase para desarrollo        |
| `firebase deploy`          | Despliega a Firebase (staging/production)     |

## 🔧 Funcionalidades

### ✅ Implementadas

- **Autenticación**: Sistema completo con Firebase Auth
- **Newsletter**: Suscripción y envío de correos con Mailgun
- **Admin Panel**: Gestión de contenido para administradores
- **Sistema de Pagos**: Integración completa con Mercado Pago
  - Suscripciones mensuales y anuales
  - Donaciones con muro de donantes
  - Registro a eventos académicos
- **Responsive Design**: Optimizado para todos los dispositivos
- **SEO**: Optimización para motores de búsqueda
- **Security**: Sistema de configuración seguro y validación

### 🚧 En Desarrollo

- Sistema de comentarios
- Galería de imágenes avanzada
- Blog/Artículos
- Calendario de eventos
- Biblioteca digital

## 📊 Monitoreo y Analytics

- **Firebase Analytics**: Tracking de usuarios y eventos
- **Performance Monitoring**: Métricas de rendimiento
- **Error Tracking**: Logs centralizados de errores
- **Security Rules**: Reglas de seguridad de Firestore

## 🚀 Despliegue

### Desarrollo → Staging

```bash
# Build y deploy a staging
npm run build
firebase use staging
firebase deploy
```

### Staging → Producción

```bash
# Deploy a producción
firebase use production
firebase deploy --only hosting,functions
```

### Verificaciones Pre-Deploy

1. ✅ Tests pasan
2. ✅ Build sin errores
3. ✅ Variables de entorno configuradas
4. ✅ Firebase Functions actualizadas
5. ✅ Reglas de seguridad revisadas

## 🐛 Troubleshooting

### Problemas Comunes

**Error: "Missing environment variables"**
- Verifica tu archivo `.env.local`
- Consulta [`ENV_VARIABLES.md`](./ENV_VARIABLES.md)

**Error: "Firebase initialization failed"**
- Verifica las credenciales de Firebase
- Confirma que el proyecto ID sea correcto

**Error: "Mailgun sending failed"**
- Verifica la configuración en Firebase Functions
- `firebase functions:config:get`

## 📚 Documentación

- [`SECURITY_SETUP.md`](./SECURITY_SETUP.md) - Configuración de seguridad completa
- [`ENV_VARIABLES.md`](./ENV_VARIABLES.md) - Variables de entorno detalladas
- [`MERCADOPAGO_SETUP.md`](./MERCADOPAGO_SETUP.md) - **Configuración de Mercado Pago paso a paso**
- [Astro Docs](https://docs.astro.build) - Documentación del framework
- [Firebase Docs](https://firebase.google.com/docs) - Documentación de Firebase
- [Mercado Pago Docs](https://www.mercadopago.com.uy/developers/es/docs) - API de Mercado Pago

## 🤝 Contribuciones

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es propietario del Centro Umbandista Reino Da Mata.

## 📞 Contacto

- **Sitio Web**: [centroumbandistareinodamata.org](https://centroumbandistareinodamata.org)
- **Email**: contacto@centroumbandistareinodamata.org

---

**⚡ Desarrollado con Astro ⚡**

```sh
npm create astro@latest -- --template minimal
```

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/withastro/astro/tree/latest/examples/minimal)
[![Open with CodeSandbox](https://assets.codesandbox.io/github/button-edit-lime.svg)](https://codesandbox.io/p/sandbox/github/withastro/astro/tree/latest/examples/minimal)
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/withastro/astro?devcontainer_path=.devcontainer/minimal/devcontainer.json)

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
├── src/
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
