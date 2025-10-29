# 🖼️ Plan de Imágenes para Landing Page

## Imágenes Disponibles

### **1. Templo Interior**
```
https://firebasestorage.googleapis.com/v0/b/reino-da-mata-2fea3.firebasestorage.app/o/templo_112.jpg?alt=media&token=bcf09534-6397-4ad9-b21e-919b2f7ef59c
```
**Uso sugerido**: Hero Section o sección "Sobre Nosotros"

---

### **2. Templo Interior 2**
```
https://firebasestorage.googleapis.com/v0/b/reino-da-mata-2fea3.firebasestorage.app/o/templo_110.jpg?alt=media&token=17e7f62b-6609-4436-964c-ca13e73cb357
```
**Uso sugerido**: Sección "Nuestro Espacio" o galería

---

### **3. Comunidad**
```
https://firebasestorage.googleapis.com/v0/b/reino-da-mata-160a9.appspot.com/o/comunidad_2.jpeg?alt=media&token=e4087073-729d-43f1-a23d-dfb8d8426bd6
```
**Uso sugerido**: Sección "Sobre Nosotros" - mostrar comunidad activa

---

### **4. Congal/Ceremonia**
```
https://firebasestorage.googleapis.com/v0/b/reino-da-mata-160a9.appspot.com/o/congal_1.webp?alt=media&token=cce2241f-fa25-4dca-9aa4-5b248ca2dd68
```
**Uso sugerido**: Sección "Actividades" o hero alternativo

---

### **5. Grupo Interno**
```
https://firebasestorage.googleapis.com/v0/b/reino-da-mata-160a9.appspot.com/o/grupo_interno.jpeg?alt=media&token=e796a669-de3d-4c61-8382-6ea4d83ef426
```
**Uso sugerido**: Testimonios o sección "Comunidad"

---

### **6. Actividad en Torre de Antel**
```
https://firebasestorage.googleapis.com/v0/b/reino-da-mata-160a9.appspot.com/o/torre_de_antel_actividad.webp?alt=media&token=077234e5-09c5-420a-8804-094f418e25c1
```
**Uso sugerido**: Sección "Eventos" o actividades especiales

---

## 📐 Distribución en Landing Page

### **Hero Section**
**Imagen**: Templo Interior (templo_112.jpg)
**Razón**: Impactante, muestra el espacio sagrado
**Estilo**: Fondo con overlay oscuro, texto blanco centrado

---

### **Sección "Sobre Nosotros"**
**Layout**: Grid de 2-3 imágenes
**Imágenes**:
- Comunidad (comunidad_2.jpeg) - Izquierda
- Grupo Interno (grupo_interno.jpeg) - Derecha
- Templo Interior 2 (templo_110.jpg) - Centro (opcional)

---

### **Sección "Nuestro Espacio"** (Nueva)
**Imágenes**:
- Templo Interior alternando
- Congal/Ceremonia

**Layout**: Carousel o grid

---

### **Sección "Próximos Eventos"**
**Imagen de fondo sutil**: Torre de Antel actividad
**Estilo**: Overlay blanco semi-transparente, cards de eventos sobre ella

---

## 🎨 Implementación

### **Paso 1: Crear constantes**

```typescript
// src/utils/images.ts
export const LANDING_IMAGES = {
  hero: {
    templo: 'https://firebasestorage.googleapis.com/v0/b/reino-da-mata-2fea3.firebasestorage.app/o/templo_112.jpg?alt=media&token=bcf09534-6397-4ad9-b21e-919b2f7ef59c',
    alt: 'Templo Reino Da Mata'
  },
  gallery: [
    {
      url: 'https://firebasestorage.googleapis.com/v0/b/reino-da-mata-2fea3.firebasestorage.app/o/templo_110.jpg?alt=media&token=17e7f62b-6609-4436-964c-ca13e73cb357',
      alt: 'Interior del Templo',
      title: 'Nuestro Espacio Sagrado'
    },
    {
      url: 'https://firebasestorage.googleapis.com/v0/b/reino-da-mata-160a9.appspot.com/o/comunidad_2.jpeg?alt=media&token=e4087073-729d-43f1-a23d-dfb8d8426bd6',
      alt: 'Comunidad reunida',
      title: 'Nuestra Comunidad'
    },
    {
      url: 'https://firebasestorage.googleapis.com/v0/b/reino-da-mata-160a9.appspot.com/o/congal_1.webp?alt=media&token=cce2241f-fa25-4dca-9aa4-5b248ca2dd68',
      alt: 'Ceremonia',
      title: 'Actividades Espirituales'
    },
    {
      url: 'https://firebasestorage.googleapis.com/v0/b/reino-da-mata-160a9.appspot.com/o/grupo_interno.jpeg?alt=media&token=e796a669-de3d-4c61-8382-6ea4d83ef426',
      alt: 'Grupo de estudio',
      title: 'Aprendizaje Conjunto'
    },
    {
      url: 'https://firebasestorage.googleapis.com/v0/b/reino-da-mata-160a9.appspot.com/o/torre_de_antel_actividad.webp?alt=media&token=077234e5-09c5-420a-8804-094f418e25c1',
      alt: 'Actividad especial',
      title: 'Eventos Especiales'
    }
  ]
};
```

---

### **Paso 2: Hero con imagen de fondo**

```astro
---
// src/components/landing/Hero.astro
import { LANDING_IMAGES } from '@/utils/images';
---

<section class="relative h-screen flex items-center justify-center overflow-hidden">
  <!-- Imagen de fondo -->
  <div class="absolute inset-0 z-0">
    <img
      src={LANDING_IMAGES.hero.templo}
      alt={LANDING_IMAGES.hero.alt}
      class="w-full h-full object-cover"
      loading="eager"
    />
    <!-- Overlay para legibilidad -->
    <div class="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80"></div>
  </div>

  <!-- Contenido -->
  <div class="relative z-10 text-center text-white max-w-4xl px-4">
    <h1 class="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
      Centro Umbandista Reino Da Mata
    </h1>
    <p class="text-xl md:text-2xl mb-8 text-gray-200 animate-fade-in-delay">
      Un espacio sagrado para el crecimiento espiritual y la comunidad
    </p>
    <div class="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-delay-2">
      <a
        href="/instituto"
        class="px-8 py-4 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg text-lg transition-all transform hover:scale-105"
      >
        Conocer el Instituto →
      </a>
      <a
        href="/eventos"
        class="px-8 py-4 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-semibold rounded-lg text-lg transition-all border border-white/30"
      >
        Ver Próximos Eventos
      </a>
    </div>
  </div>

  <!-- Indicador de scroll -->
  <div class="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
    <svg class="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
    </svg>
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

  .animate-fade-in-delay {
    animation: fade-in 0.8s ease-out 0.2s backwards;
  }

  .animate-fade-in-delay-2 {
    animation: fade-in 0.8s ease-out 0.4s backwards;
  }
</style>
```

---

### **Paso 3: Galería "Sobre Nosotros"**

```astro
---
// src/components/landing/AboutSection.astro
import { LANDING_IMAGES } from '@/utils/images';
---

<section class="py-20 bg-gray-900">
  <div class="container mx-auto px-4">
    <!-- Título -->
    <div class="text-center mb-16">
      <h2 class="text-4xl md:text-5xl font-bold text-white mb-4">
        Sobre Nosotros
      </h2>
      <p class="text-xl text-gray-300 max-w-3xl mx-auto">
        Somos una comunidad dedicada a la práctica de la Umbanda,
        promoviendo el crecimiento espiritual y el servicio a la comunidad.
      </p>
    </div>

    <!-- Grid de imágenes -->
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
      {LANDING_IMAGES.gallery.slice(0, 3).map(image => (
        <div class="group relative overflow-hidden rounded-lg aspect-[4/3]">
          <img
            src={image.url}
            alt={image.alt}
            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div class="absolute bottom-0 left-0 right-0 p-6">
              <h3 class="text-white text-xl font-semibold">{image.title}</h3>
            </div>
          </div>
        </div>
      ))}
    </div>

    <!-- Valores/Misión -->
    <div class="grid md:grid-cols-3 gap-8 mt-12">
      <div class="text-center">
        <div class="text-4xl mb-4">🕯️</div>
        <h3 class="text-xl font-semibold text-white mb-2">Espiritualidad</h3>
        <p class="text-gray-400">
          Práctica auténtica de la Umbanda con respeto a la tradición
        </p>
      </div>
      <div class="text-center">
        <div class="text-4xl mb-4">🤝</div>
        <h3 class="text-xl font-semibold text-white mb-2">Comunidad</h3>
        <p class="text-gray-400">
          Espacio acogedor para todos los que buscan crecimiento espiritual
        </p>
      </div>
      <div class="text-center">
        <div class="text-4xl mb-4">📚</div>
        <h3 class="text-xl font-semibold text-white mb-2">Conocimiento</h3>
        <p class="text-gray-400">
          Talleres, seminarios y eventos para profundizar en la práctica
        </p>
      </div>
    </div>

    <!-- CTA -->
    <div class="text-center mt-12">
      <a
        href="/nosotros"
        class="inline-block px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg transition-colors"
      >
        Conocer Nuestra Historia →
      </a>
    </div>
  </div>
</section>
```

---

### **Paso 4: Optimización de imágenes**

```typescript
// src/utils/imageOptimizer.ts

/**
 * Genera URL de imagen optimizada con parámetros de Firebase Storage
 */
export function optimizeFirebaseImage(
  url: string,
  options: {
    width?: number;
    quality?: number;
    format?: 'webp' | 'jpeg';
  } = {}
) {
  const { width = 1200, quality = 80, format = 'webp' } = options;

  // Firebase Storage no tiene optimización automática,
  // pero podemos usar servicios externos o pre-procesar

  // Por ahora, devolver la URL original
  // TODO: Implementar optimización con cloud function
  return url;
}

/**
 * Genera srcset para imágenes responsive
 */
export function generateSrcSet(baseUrl: string, widths: number[] = [640, 768, 1024, 1280, 1920]) {
  return widths
    .map(w => `${optimizeFirebaseImage(baseUrl, { width: w })} ${w}w`)
    .join(', ');
}
```

---

## ✅ Checklist de Implementación

### **Hoy (1-2 horas)**
- [ ] Crear `src/utils/images.ts` con constantes
- [ ] Crear `Hero.astro` con imagen de templo
- [ ] Probar en navegador
- [ ] Ajustar overlay y contraste

### **Mañana (1-2 horas)**
- [ ] Crear `AboutSection.astro` con galería
- [ ] Grid de 3 imágenes
- [ ] Efectos hover
- [ ] Testing responsive

### **Día 3 (opcional)**
- [ ] Optimizar carga de imágenes
- [ ] Lazy loading
- [ ] Placeholder blur
- [ ] Performance testing

---

## 🎨 Paleta de Colores Sugerida

Basándome en las imágenes (tonos cálidos, madera, velas):

```css
:root {
  --color-primary: #2D5016;     /* Verde oliva (de las plantas) */
  --color-secondary: #D4A574;   /* Dorado/madera */
  --color-accent: #8B4513;      /* Marrón cálido */
  --color-dark: #1a1a1a;        /* Negro suave */
  --color-light: #F5F5DC;       /* Beige claro */
}
```

---

## 📱 Responsive Strategy

### **Mobile (< 768px)**
- Hero: Imagen de fondo, texto centrado
- Galería: 1 columna
- Cards más grandes

### **Tablet (768px - 1024px)**
- Hero: Mantener full screen
- Galería: 2 columnas
- Spacing optimizado

### **Desktop (> 1024px)**
- Hero: Full screen con parallax (opcional)
- Galería: 3 columnas
- Efectos hover activos

---

## 🚀 Próximos Pasos

1. ✅ Crear branch `feature/landing-v2` (hecho)
2. ✅ Crear carpeta `src/components/landing/` (hecho)
3. 📝 Crear `src/utils/images.ts`
4. 🎨 Implementar `Hero.astro`
5. 🖼️ Implementar `AboutSection.astro`
6. 🧪 Testing y ajustes

---

**¿Listo para empezar?** 🚀

Vamos a crear el Hero section primero con la imagen del templo.
