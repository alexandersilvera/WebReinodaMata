/**
 * Hero Section V2 - Landing Page
 * Centro Umbandista Reino Da Mata
 *
 * Mejoras implementadas:
 * - Framer Motion para animaciones fluidas
 * - Parallax scroll effect
 * - Números animados (count-up)
 * - Micro-interacciones en CTAs
 * - Optimización de performance
 */

import { motion, useScroll, useTransform, type Variants, useMotionValue, useSpring } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';

const Hero = () => {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollY } = useScroll();

  // Parallax effect - el fondo se mueve más lento que el scroll
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const contentOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  // Variantes de animación
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.6, 0.05, 0.01, 0.9] as const // Cubic bezier para suavidad
      }
    }
  };

  return (
    <section
      ref={containerRef}
      className="relative h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Video/Imagen de fondo con parallax */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{ y }}
      >
        {/* Video de Vimeo con lazy loading */}
        <iframe
          src="https://player.vimeo.com/video/1132797148?autoplay=1&loop=1&muted=1&controls=0&background=1&playsinline=1&quality=auto"
          className="absolute top-1/2 left-1/2 w-[100vw] h-[100vh] min-w-full min-h-full -translate-x-1/2 -translate-y-1/2 border-0"
          style={{ pointerEvents: 'none' }}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title="Centro Umbandista Reino Da Mata"
          loading="lazy"
        />

        {/* Overlay gradiente dinámico */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        />
      </motion.div>

      {/* Contenido principal */}
      <motion.div
        className="relative z-10 text-center text-white max-w-5xl px-4 sm:px-6 lg:px-8"
        style={{ opacity: contentOpacity }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Título con gradiente */}
        <motion.h1
          variants={itemVariants}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
        >
          <span className="block bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 animate-gradient">
            Centro Umbandista
          </span>
          <span className="block mt-2">Reino Da Mata</span>
        </motion.h1>

        {/* Subtítulo */}
        <motion.p
          variants={itemVariants}
          className="text-lg sm:text-xl md:text-2xl mb-10 text-gray-200 max-w-3xl mx-auto leading-relaxed"
        >
          Un espacio sagrado para el crecimiento espiritual,
          el conocimiento y la comunidad
        </motion.p>

        {/* CTAs con micro-interacciones */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          {/* CTA Primario */}
          <motion.a
            href="/instituto"
            className="w-full sm:w-auto px-8 py-4 bg-green-600 text-white font-semibold rounded-lg text-lg inline-flex items-center justify-center gap-2 shadow-lg"
            whileHover={{
              scale: 1.05,
              boxShadow: "0 20px 40px rgba(34, 197, 94, 0.4)",
              backgroundColor: "#16a34a"
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <span>Conocer el Instituto</span>
            <motion.svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              initial={{ x: 0 }}
              animate={{ x: [0, 5, 0] }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
                ease: "easeInOut"
              }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </motion.svg>
          </motion.a>

          {/* CTA Secundario */}
          <motion.a
            href="/eventos"
            className="w-full sm:w-auto px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-lg text-lg border-2 border-white/30 inline-flex items-center justify-center"
            whileHover={{
              scale: 1.05,
              backgroundColor: "rgba(255,255,255,0.3)",
              borderColor: "rgba(255,255,255,0.5)"
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            Ver Próximos Eventos
          </motion.a>
        </motion.div>

        {/* Estadísticas animadas */}
        <motion.div
          variants={itemVariants}
          className="mt-16 grid grid-cols-3 gap-6 sm:gap-8 max-w-2xl mx-auto"
        >
          <AnimatedStat value={15} label="Años de trayectoria" suffix="+" delay={0.8} />
          <AnimatedStat value={100} label="Miembros activos" suffix="+" delay={1} />
          <AnimatedStat value={50} label="Eventos anuales" suffix="+" delay={1.2} />
        </motion.div>
      </motion.div>

      {/* Scroll indicator con animación */}
      <motion.a
        href="#sobre-nosotros"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 cursor-pointer group hidden md:flex"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.5 }}
      >
        <span className="text-white/60 text-sm group-hover:text-white/90 transition-colors duration-300">
          Descubre más
        </span>
        <motion.svg
          className="w-6 h-6 text-white/60 group-hover:text-white/90 transition-colors duration-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          animate={{ y: [0, 10, 0] }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
            ease: "easeInOut"
          }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </motion.svg>
      </motion.a>
    </section>
  );
};

/**
 * Componente de estadística con animación de count-up
 */
interface AnimatedStatProps {
  value: number;
  label: string;
  suffix?: string;
  delay?: number;
}

function AnimatedStat({ value, label, suffix = '', delay = 0 }: AnimatedStatProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { duration: 2500 });
  const [displayValue, setDisplayValue] = useState(0);

  // Detectar cuando el elemento es visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          // Iniciar animación del contador
          motionValue.set(value);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated, value, motionValue]);

  // Actualizar el valor mostrado cuando springValue cambia
  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      setDisplayValue(Math.round(latest));
    });

    return () => unsubscribe();
  }, [springValue]);

  return (
    <motion.div
      ref={ref}
      className="text-center"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={hasAnimated ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.6, delay }}
    >
      <motion.div
        className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-600"
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.2 }}
      >
        {displayValue}{suffix}
      </motion.div>
      <div className="text-xs sm:text-sm text-gray-300 mt-2 leading-tight">
        {label}
      </div>
    </motion.div>
  );
}

export default Hero;
