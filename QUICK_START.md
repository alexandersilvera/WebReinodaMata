# 🚀 Quick Start - Comenzar HOY

**Última actualización**: 2025-10-25
**Objetivo**: Empezar con Landing Page V2

---

## ✅ Checklist Pre-Start (5 minutos)

### **1. Documentación**
- [ ] Leí `PLAN_RESUMEN.md` ✅ (Ya lo tienes)
- [ ] Revisé `SPRINT_PLAN.md` - Próximas 2 semanas
- [ ] Entiendo las prioridades: Landing Page primero

### **2. Ambiente de Desarrollo**
```bash
# Verificar que todo funciona
npm run dev          # ¿Se levanta el servidor?
npm run build        # ¿Build exitoso?
git status           # ¿Rama correcta?
```

### **3. Mental Prep**
- [ ] Tengo 1-2 horas disponibles HOY
- [ ] Calendario bloqueado para próximas 2 semanas
- [ ] Entiendo que es un proceso iterativo

---

## 📋 SEMANA 1: Landing Page - Checklist Día a Día

### **📅 Día 1: Setup + Hero Section (HOY)**

#### **Mañana (1-2 horas)**
```bash
# 1. Crear branch de trabajo
git checkout -b feature/landing-v2
git push -u origin feature/landing-v2

# 2. Instalar dependencias
npm install framer-motion clsx

# 3. Crear estructura
mkdir -p src/components/landing
touch src/components/landing/Hero.astro
```

#### **Tarde (1-2 horas)**
- [ ] **Bosquejar diseño** (papel o Figma - 15 min)
  - Hero con imagen de fondo
  - Título claro y llamativo
  - CTA destacado ("Conocer el Instituto")
  - Diseño responsive

- [ ] **Implementar Hero básico** (45 min)
```astro
---
// src/components/landing/Hero.astro
---
<section class="relative h-screen flex items-center justify-center">
  <!-- Imagen de fondo -->
  <div class="absolute inset-0 z-0">
    <img
      src="/path/to/hero-image.jpg"
      alt="Reino Da Mata"
      class="w-full h-full object-cover opacity-80"
    />
    <div class="absolute inset-0 bg-gradient-to-b from-black/60 to-black/80"></div>
  </div>

  <!-- Contenido -->
  <div class="relative z-10 text-center text-white max-w-4xl px-4">
    <h1 class="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
      Centro Umbandista Reino Da Mata
    </h1>
    <p class="text-xl md:text-2xl mb-8 text-gray-200">
      Espiritualidad, conocimiento y comunidad
    </p>
    <a
      href="/instituto"
      class="inline-block px-8 py-4 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg text-lg transition-all transform hover:scale-105"
    >
      Conocer el Instituto →
    </a>
  </div>
</section>

<style>
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .animate-fade-in {
    animation: fade-in 0.8s ease-out;
  }
</style>
```

- [ ] **Integrar en landing** (15 min)
```astro
---
// src/pages/index.astro
import Hero from '@/components/landing/Hero.astro';
---
<MainLayout>
  <Hero />
  <!-- Resto del contenido... -->
</MainLayout>
```

- [ ] **Testing básico**
  - [ ] ¿Se ve bien en desktop?
  - [ ] ¿Se ve bien en móvil?
  - [ ] ¿El CTA funciona?

#### **✅ Done Day 1**
Commit: `git commit -m "feat: agregar Hero section a landing page"`

---

### **📅 Día 2: Mejorar Hero + Animaciones**

- [ ] **Optimizar imagen de fondo** (30 min)
  - Convertir a WebP
  - Lazy loading
  - Responsive sizes

- [ ] **Agregar animaciones** (1 hora)
```bash
npm install framer-motion
```

```tsx
// src/components/landing/HeroAnimated.tsx
import { motion } from 'framer-motion';

export default function HeroAnimated() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Contenido del hero */}
    </motion.div>
  );
}
```

- [ ] **Ajustes de diseño** (30 min)
  - Spacing perfecto
  - Colores ajustados
  - Tipografía refinada

#### **✅ Done Day 2**
Commit: `git commit -m "feat: agregar animaciones y optimizar Hero"`

---

### **📅 Día 3: Sección Próximos Eventos**

- [ ] **Crear componente** (2 horas)
```tsx
// src/components/landing/UpcomingEventsHome.tsx
import { useState, useEffect } from 'react';
import { eventService } from '@/features/events';

export default function UpcomingEventsHome() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    eventService.getUpcoming(3).then(setEvents).finally(() => setLoading(false));
  }, []);

  if (loading) return <SkeletonLoader />;

  return (
    <section className="py-16 bg-gray-900">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-white text-center mb-12">
          Próximos Eventos
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {events.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>

        <div className="text-center mt-8">
          <a href="/eventos" className="text-green-400 hover:text-green-300">
            Ver todos los eventos →
          </a>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Integrar en landing**
- [ ] **Testing**

#### **✅ Done Day 3**
Commit: `git commit -m "feat: agregar sección Próximos Eventos"`

---

### **📅 Día 4: Sección Últimas del Blog**

- [ ] **Crear componente** (2 horas)
```tsx
// src/components/landing/LatestBlogPosts.tsx
import { useState, useEffect } from 'react';
import { getAllArticles } from '@/services/articleService';

export default function LatestBlogPosts() {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    getAllArticles({ limitCount: 2 }).then(setArticles);
  }, []);

  return (
    <section className="py-16 bg-gray-800">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-white text-center mb-12">
          Últimos Artículos
        </h2>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {articles.map(article => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>

        <div className="text-center mt-8">
          <a href="/blog" className="inline-block px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg">
            Ver todos los artículos →
          </a>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Diseño de ArticleCard destacada**
- [ ] **Testing**

#### **✅ Done Day 4**
Commit: `git commit -m "feat: agregar sección Últimas del Blog (2 artículos)"`

---

### **📅 Día 5: Optimización + Testing**

- [ ] **Optimizar imágenes** (1 hora)
  - Convertir todas a WebP
  - Agregar lazy loading
  - Responsive images

- [ ] **Performance testing** (30 min)
```bash
npm run build
npx lighthouse http://localhost:4321 --view
```

- [ ] **Testing manual** (30 min)
  - Desktop Chrome
  - Mobile (DevTools)
  - Firefox
  - Safari (si disponible)

- [ ] **Fixes y ajustes** (1 hora)

#### **✅ Done Day 5**
Commit: `git commit -m "perf: optimizar imágenes y performance de landing"`

---

## 📊 Checklist de Calidad

Antes de considerar la semana 1 completada:

### **Visual**
- [ ] Hero impactante y claro
- [ ] Secciones bien espaciadas
- [ ] Colores consistentes
- [ ] Tipografía legible
- [ ] Imágenes optimizadas

### **Funcional**
- [ ] Todos los links funcionan
- [ ] CTAs claros y visibles
- [ ] Eventos se cargan correctamente
- [ ] Artículos se cargan correctamente
- [ ] Loading states en todos lados

### **Performance**
- [ ] Lighthouse Performance > 80
- [ ] First Contentful Paint < 2s
- [ ] No errores en consola
- [ ] Build exitoso sin warnings críticos

### **Responsive**
- [ ] Mobile (320px - 768px) ✓
- [ ] Tablet (768px - 1024px) ✓
- [ ] Desktop (1024px+) ✓

---

## 🎯 Si te Bloqueas

### **Problema: No sé cómo diseñar el Hero**
**Solución**:
1. Ve a [Awwwards](https://www.awwwards.com/)
2. Busca "spiritual website" o "institute website"
3. Toma inspiración (no copies directo)
4. Simplifica

### **Problema: Animaciones no funcionan**
**Solución**:
1. Verifica que Framer Motion está instalado
2. Usa `client:load` en Astro: `<Component client:load />`
3. Empieza simple (CSS animations primero)

### **Problema: Performance bajo**
**Solución**:
1. Optimiza imágenes (usa https://squoosh.app/)
2. Lazy loading agresivo
3. Reduce bundle con code splitting

### **Problema: No tengo tiempo**
**Solución**:
1. Prioriza: Hero > Eventos > Blog > Resto
2. MVP primero, pulir después
3. 1 hora al día es suficiente

---

## 💡 Tips de Productividad

### **Técnica Pomodoro**
```
25 min FOCUS → 5 min BREAK → Repeat
Cada 4 pomodoros: 15-30 min break largo
```

### **Commits Frecuentes**
```bash
# Después de cada feature pequeño
git add .
git commit -m "feat: descripción clara"

# Push al final del día
git push
```

### **Testing Continuo**
No esperes al final para probar. Prueba mientras desarrollas:
- `npm run dev` siempre corriendo
- Browser abierto con auto-refresh
- DevTools abiertos

---

## 🎉 Celebra los Pequeños Wins

- ✅ Hero funcionando → ¡Foto y compartir!
- ✅ Primera animación → ¡Muéstraselo a alguien!
- ✅ Landing completa → ¡Deploy a staging y celebra!

---

## 📞 Need Help?

Si te bloqueas:
1. Google el error específico
2. Stack Overflow
3. Astro Discord
4. Toma un break de 15 min

---

**¡Éxito! Tienes todo lo que necesitas para empezar.**

**Tu próxima acción**:
1. ☑️ Leer este documento
2. ☑️ Crear branch `feature/landing-v2`
3. ☑️ Crear `Hero.astro`
4. 🚀 **¡A codear!**

---

**Recordatorio**: Progreso > Perfección. MVP primero, pulir después.

**¿Listo?** → `git checkout -b feature/landing-v2` 🎨
