/**
 * Scroll Animations con Intersection Observer
 * Sistema ligero y performante para animar elementos al hacer scroll
 */

/**
 * Opciones para el Intersection Observer
 */
interface ScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean; // Si true, anima solo una vez
}

/**
 * Inicializa las animaciones de scroll para elementos con clase .scroll-animate
 */
export function initScrollAnimations(options: ScrollAnimationOptions = {}) {
  // Respeta preferencias de usuario para reducir movimiento
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    // Si el usuario prefiere reducir movimiento, mostrar todo inmediatamente
    const elements = document.querySelectorAll('.scroll-animate, [class*="scroll-animate-"]');
    elements.forEach((el) => {
      el.classList.add('is-visible');
    });
    return;
  }

  const {
    threshold = 0.1, // 10% del elemento visible
    rootMargin = '0px 0px -50px 0px', // Trigger un poco antes de que sea visible
    once = true // Por defecto, animar solo una vez
  } = options;

  // Crear Intersection Observer
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Elemento está visible, activar animación
          entry.target.classList.add('is-visible');

          // Si once=true, dejar de observar este elemento
          if (once) {
            observer.unobserve(entry.target);
          }
        } else if (!once) {
          // Si once=false, quitar la clase cuando sale del viewport
          entry.target.classList.remove('is-visible');
        }
      });
    },
    {
      threshold,
      rootMargin
    }
  );

  // Observar todos los elementos con clases de animación
  const animatedElements = document.querySelectorAll(
    '.scroll-animate, ' +
    '.scroll-animate-up, ' +
    '.scroll-animate-down, ' +
    '.scroll-animate-left, ' +
    '.scroll-animate-right, ' +
    '.scroll-animate-scale'
  );

  animatedElements.forEach((el) => {
    observer.observe(el);
  });

  // Retornar el observer para limpieza posterior si es necesario
  return observer;
}

/**
 * Parallax effect suave en scroll
 */
export function initParallax() {
  const parallaxElements = document.querySelectorAll('.parallax-slow');

  if (parallaxElements.length === 0) return;

  // Throttle para performance
  let ticking = false;

  const updateParallax = () => {
    const scrollY = window.scrollY;

    parallaxElements.forEach((element) => {
      const speed = parseFloat(element.getAttribute('data-parallax-speed') || '0.5');
      const yPos = -(scrollY * speed);
      (element as HTMLElement).style.transform = `translate3d(0, ${yPos}px, 0)`;
    });

    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateParallax);
      ticking = true;
    }
  });
}

/**
 * Smooth scroll para enlaces internos
 */
export function initSmoothScroll() {
  // El smooth scroll ya está habilitado en CSS, pero podemos agregar
  // comportamiento adicional para enlaces con hash
  const links = document.querySelectorAll('a[href^="#"]');

  links.forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      // Scroll suave con offset para el header fijo
      const headerOffset = 80;
      const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerOffset;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });

      // Actualizar URL sin recargar
      history.pushState(null, '', href);
    });
  });
}

/**
 * Stagger animation para listas de elementos
 */
export function initStaggerAnimation(containerSelector: string, itemSelector: string) {
  const containers = document.querySelectorAll(containerSelector);

  containers.forEach((container) => {
    const items = container.querySelectorAll(itemSelector);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Animar items con delay
            items.forEach((item, index) => {
              setTimeout(() => {
                item.classList.add('is-visible');
              }, index * 100); // 100ms entre cada item
            });

            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(container);
  });
}

/**
 * Hover effect mejorado para elementos interactivos
 */
export function enhanceHoverEffects() {
  // Agregar clases de hover automáticamente a elementos interactivos
  const cards = document.querySelectorAll('.card, [class*="card-"]');
  cards.forEach((card) => {
    if (!card.classList.contains('hover-lift')) {
      card.classList.add('hover-lift', 'animate-gpu');
    }
  });

  const buttons = document.querySelectorAll('button, .btn, [role="button"]');
  buttons.forEach((button) => {
    if (!button.classList.contains('hover-glow') &&
        button.classList.contains('bg-green-600')) {
      button.classList.add('hover-shine');
    }
  });
}

/**
 * Inicializar todas las animaciones
 * Llamar esta función cuando el DOM esté listo
 */
export function initAllAnimations() {
  // Esperar a que el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setupAnimations();
    });
  } else {
    setupAnimations();
  }
}

function setupAnimations() {
  initScrollAnimations();
  initSmoothScroll();
  enhanceHoverEffects();

  // Parallax solo en desktop para mejor performance
  if (window.innerWidth > 1024) {
    initParallax();
  }
}

// Auto-inicializar si está en el browser
if (typeof window !== 'undefined') {
  initAllAnimations();
}
