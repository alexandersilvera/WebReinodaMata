# 🏃 Plan de Sprint - Próximas 2 Semanas

## 📅 Sprint 1: Landing Page & UX Improvements
**Duración**: 2 semanas
**Inicio**: 2025-10-25
**Objetivo**: Mejorar la primera impresión y experiencia del usuario

---

## 🎯 Objetivos del Sprint

### **Objetivo Principal**
Transformar la landing page en una experiencia profesional y atractiva que convierta visitantes en usuarios registrados o suscriptores.

### **KPIs de Éxito**
- [ ] Landing page con diseño moderno implementado
- [ ] Lighthouse Performance score > 85
- [ ] Tiempo de carga < 3 segundos
- [ ] 0 errores en consola
- [ ] Mobile responsive 100%

---

## 📋 Backlog del Sprint

### **🔴 ALTA PRIORIDAD (Hacer primero)**

#### **Tarea 1: Hero Section Moderno** ⏱️ 1-2 días
**Descripción**: Crear un hero impactante que comunique valor inmediato

**Subtareas**:
- [ ] Diseño de hero section en Figma/papel
  - CTA principal claro ("Conocer el Instituto" / "Próximos Eventos")
  - Imagen/video de fondo atractivo
  - Texto de valor claro y conciso
- [ ] Implementar componente `Hero.astro`
- [ ] Agregar animaciones de entrada (fade-in)
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Optimizar imagen de fondo (WebP, lazy loading)

**Archivos**:
```
src/components/Hero.astro (crear)
src/pages/index.astro (modificar)
```

**Criterios de aceptación**:
- ✅ Hero visible en < 1 segundo
- ✅ CTA destacado y funcional
- ✅ Animación suave sin jank
- ✅ Responsive en todos los breakpoints

---

#### **Tarea 2: Sección "Próximos Eventos"** ⏱️ 1 día
**Descripción**: Widget destacado de próximos 3 eventos

**Subtareas**:
- [ ] Crear componente `UpcomingEventsHome.tsx`
- [ ] Consultar eventos desde Firestore (próximos 30 días)
- [ ] Diseño de cards atractivas
- [ ] Link a página de eventos
- [ ] Skeleton loading mientras carga

**Archivos**:
```
src/components/UpcomingEventsHome.tsx (crear)
src/pages/index.astro (integrar)
```

**Criterios de aceptación**:
- ✅ Muestra 3 eventos próximos
- ✅ Cards con imagen, fecha, título, precio
- ✅ Link funcional a detalle de evento
- ✅ Loading state elegante

---

#### **Tarea 3: Sección "Últimas del Blog"** ⏱️ 1 día
**Descripción**: Mostrar últimos 4 artículos del blog

**Subtareas**:
- [ ] Crear componente `LatestBlogPosts.tsx`
- [ ] Consultar últimos artículos publicados
- [ ] Diseño de cards con imagen y excerpt
- [ ] Link a página de blog
- [ ] Tags destacados

**Archivos**:
```
src/components/LatestBlogPosts.tsx (crear)
src/pages/index.astro (integrar)
```

**Criterios de aceptación**:
- ✅ Muestra 4 artículos más recientes
- ✅ Imagen, título, fecha, excerpt, tags
- ✅ Hover effects
- ✅ Link funcional a artículo completo

---

#### **Tarea 4: Optimización de Imágenes** ⏱️ 0.5 días
**Descripción**: Optimizar todas las imágenes del landing

**Subtareas**:
- [ ] Convertir imágenes a WebP
- [ ] Implementar `<Image>` de Astro
- [ ] Agregar lazy loading
- [ ] Generar múltiples tamaños (srcset)
- [ ] Comprimir assets existentes

**Criterios de aceptación**:
- ✅ Todas las imágenes en WebP con fallback
- ✅ Lazy loading funcional
- ✅ Reduce tamaño total en 50%+

---

### **🟡 MEDIA PRIORIDAD (Si hay tiempo)**

#### **Tarea 5: Sección "Sobre Nosotros" Mejorada** ⏱️ 1 día
**Descripción**: Hacer la sección más visual y atractiva

**Subtareas**:
- [ ] Agregar timeline de historia
- [ ] Galería de fotos del centro
- [ ] Misión, visión, valores destacados
- [ ] Estadísticas (años, miembros, eventos)

**Archivos**:
```
src/components/AboutSection.astro (crear)
src/pages/index.astro (integrar)
```

---

#### **Tarea 6: Animaciones y Micro-interacciones** ⏱️ 1 día
**Descripción**: Agregar animaciones sutiles para mejorar UX

**Subtareas**:
- [ ] Instalar Framer Motion o similar
- [ ] Scroll animations (fade, slide)
- [ ] Hover effects en cards
- [ ] Smooth scroll en navegación
- [ ] Parallax effect en hero (opcional)

**Archivos**:
```
src/utils/animations.ts (crear)
Múltiples componentes
```

---

#### **Tarea 7: SEO Mejorado** ⏱️ 0.5 días
**Descripción**: Optimizar meta tags y estructuración

**Subtareas**:
- [ ] Meta tags completos (title, description, OG)
- [ ] Schema.org markup (Organization, WebSite)
- [ ] Canonical URLs
- [ ] Robots.txt y sitemap.xml
- [ ] Favicons completos

**Archivos**:
```
src/layouts/MainLayout.astro (modificar)
public/robots.txt (crear)
```

---

### **🟢 BAJA PRIORIDAD (Nice to have)**

#### **Tarea 8: Testimonios** ⏱️ 1 día
**Descripción**: Sección de testimonios de miembros

**Subtareas**:
- [ ] Componente de testimonios
- [ ] Carousel/slider
- [ ] Fotos y nombres de miembros
- [ ] Citas destacadas

---

#### **Tarea 9: Newsletter Signup Destacado** ⏱️ 0.5 días
**Descripción**: CTA de newsletter en landing

**Subtareas**:
- [ ] Formulario inline en landing
- [ ] Modal popup (opcional)
- [ ] Integración con backend existente
- [ ] Mensaje de confirmación

---

## 🗓️ Planificación Diaria

### **Semana 1**

#### **Día 1 (Lunes)**
- [ ] Setup: Revisar roadmap y plan
- [ ] Diseño: Bosquejar landing page nueva
- [ ] Código: Empezar Hero section

#### **Día 2 (Martes)**
- [ ] Código: Completar Hero section
- [ ] Código: Agregar animaciones básicas
- [ ] Testing: Hero responsive

#### **Día 3 (Miércoles)**
- [ ] Código: Sección Próximos Eventos
- [ ] Código: Integrar con Firestore
- [ ] Testing: Loading states

#### **Día 4 (Jueves)**
- [ ] Código: Sección Últimas del Blog
- [ ] Código: Componente de cards
- [ ] Testing: Links y navegación

#### **Día 5 (Viernes)**
- [ ] Código: Optimización de imágenes
- [ ] Testing: Performance testing
- [ ] Retrospectiva: Qué funcionó, qué no

---

### **Semana 2**

#### **Día 6 (Lunes)**
- [ ] Código: Sección Sobre Nosotros mejorada
- [ ] Código: Timeline/historia
- [ ] Design: Ajustes de espaciado

#### **Día 7 (Martes)**
- [ ] Código: Animaciones avanzadas
- [ ] Código: Micro-interacciones
- [ ] Testing: Smoothness

#### **Día 8 (Miércoles)**
- [ ] Código: SEO optimizations
- [ ] Código: Meta tags, schema markup
- [ ] Testing: Lighthouse audit

#### **Día 9 (Jueves)**
- [ ] Código: Features restantes (testimonios, newsletter)
- [ ] Testing: E2E testing
- [ ] Bug fixes

#### **Día 10 (Viernes)**
- [ ] Final testing y QA
- [ ] Deploy a staging
- [ ] Demo y feedback
- [ ] Retrospectiva del sprint

---

## 🛠️ Herramientas y Setup

### **Antes de Empezar**
```bash
# Instalar dependencias nuevas
npm install framer-motion
npm install @headlessui/react
npm install clsx

# Opcional: Testing visual
npm install -D @storybook/react

# Opcional: Performance
npm install -D lighthouse
```

### **Configuración**
```bash
# Crear carpeta de componentes nuevos
mkdir -p src/components/landing
mkdir -p src/components/shared

# Branch de trabajo
git checkout -b feature/landing-page-v2
```

---

## 📊 Definition of Done (DoD)

### **Para Cada Tarea**
- [ ] Código implementado y funcional
- [ ] Tests manuales pasados
- [ ] Responsive en mobile/tablet/desktop
- [ ] No hay errores en consola
- [ ] Performance no degradado
- [ ] Código commiteado con mensaje descriptivo
- [ ] PR creado (si aplica)

### **Para el Sprint**
- [ ] Todas las tareas ALTA completadas
- [ ] Lighthouse score > 85
- [ ] Landing page deployed a staging
- [ ] Documentación actualizada
- [ ] Demo realizado
- [ ] Retrospectiva completada

---

## 🚨 Riesgos y Mitigación

### **Riesgos Identificados**

#### **R1: Scope Creep**
**Probabilidad**: Alta
**Impacto**: Medio
**Mitigación**:
- Enfocarse solo en tareas ALTA prioridad
- Time-box cada tarea
- Dejar features "nice to have" para después

#### **R2: Performance Degradation**
**Probabilidad**: Media
**Impacto**: Alto
**Mitigación**:
- Testing de performance continuo
- Bundle size monitoring
- Lazy loading agresivo

#### **R3: Complejidad de Animaciones**
**Probabilidad**: Media
**Impacto**: Bajo
**Mitigación**:
- Empezar simple (CSS animations)
- Framer Motion solo si necesario
- Opcional: Skip animaciones si bloquea

---

## 📈 Métricas de Seguimiento

### **Durante el Sprint**
- [ ] Daily: Commit count
- [ ] Daily: Tasks completed
- [ ] Mid-sprint: Performance check
- [ ] End: Lighthouse audit

### **Post-Sprint**
- [ ] User feedback (si hay beta testers)
- [ ] Analytics (bounce rate, time on page)
- [ ] Conversion rate (registros, clics en eventos)

---

## 🎯 Retrospectiva (Al Final)

### **Preguntas a Responder**
1. ¿Qué funcionó bien?
2. ¿Qué no funcionó?
3. ¿Qué aprendimos?
4. ¿Qué vamos a mejorar en el próximo sprint?
5. ¿Cumplimos con los objetivos?

### **Template**
```markdown
## Retrospectiva Sprint 1

### ✅ Logros
-

### ❌ Bloqueadores
-

### 💡 Aprendizajes
-

### 🔄 Mejoras para próximo sprint
-
```

---

## 📚 Recursos de Referencia

### **Diseño**
- [Tailwind UI Components](https://tailwindui.com/components)
- [Heroicons](https://heroicons.com/)
- [Unsplash](https://unsplash.com/) - Imágenes gratis

### **Código**
- [Astro Image](https://docs.astro.build/en/guides/images/)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [Headless UI](https://headlessui.com/)

### **Performance**
- [Web.dev Performance](https://web.dev/performance/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

---

## ✅ Checklist de Inicio

Antes de empezar el sprint:
- [ ] Leer roadmap completo
- [ ] Entender objetivos del sprint
- [ ] Setup de herramientas listo
- [ ] Branch de trabajo creado
- [ ] Diseños bosquejados
- [ ] Dependencias instaladas
- [ ] Calendario bloqueado (dedicar tiempo)

---

**Última actualización**: 2025-10-25
**Sprint**: #1 - Landing Page V2
**Responsable**: Alexander Silvera
