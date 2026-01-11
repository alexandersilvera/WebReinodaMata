/**
 * About Section V2 - Landing Page
 * Centro Umbandista Reino Da Mata
 *
 * Actualización Enero 2026:
 * - Migrado de Astro a React con Framer Motion
 * - Animaciones staggered para galería
 * - Scroll-triggered animations con useInView
 * - Hover effects mejorados en pilares
 */

import { useRef } from 'react';
import { motion, useInView, type Variants } from 'framer-motion';
import { LANDING_IMAGES } from '@/utils/images';

// Variantes de animación para el contenedor de galería
const galleryContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};

// Variantes para items de galería
const galleryItemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8, y: 30 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.6, 0.05, 0.01, 0.9] as const
    }
  }
};

// Variantes para pilares/valores
const pillarVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.6, 0.05, 0.01, 0.9] as const
    }
  }
};

export default function AboutSectionV2() {
  const sectionRef = useRef(null);
  const galleryRef = useRef(null);
  const pillarsRef = useRef(null);
  const descriptionRef = useRef(null);

  const isSectionInView = useInView(sectionRef, { once: true, margin: "0px" });
  const isGalleryInView = useInView(galleryRef, { once: true, margin: "0px" });
  const arePillarsInView = useInView(pillarsRef, { once: true, margin: "0px" });
  const isDescriptionInView = useInView(descriptionRef, { once: true, margin: "0px" });

  // Primeras 3 imágenes para la galería principal
  const galleryImages = LANDING_IMAGES.gallery.slice(0, 3);

  // Pilares del centro
  const pillars = [
    {
      icon: '🕯️',
      title: 'Espiritualidad',
      description: 'Práctica auténtica de la Umbanda con profundo respeto a la tradición y los orixás'
    },
    {
      icon: '🤝',
      title: 'Comunidad',
      description: 'Un espacio acogedor y fraterno para todos los que buscan crecimiento espiritual'
    },
    {
      icon: '📚',
      title: 'Conocimiento',
      description: 'Talleres, seminarios y eventos para profundizar en la práctica umbandista'
    }
  ];

  return (
    <section
      id="sobre-nosotros"
      ref={sectionRef}
      className="py-20 bg-gray-900 scroll-mt-20"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Título de la sección */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Sobre Nosotros
          </h2>
          <div className="w-24 h-1 bg-green-600 mx-auto mb-6"></div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Somos una comunidad dedicada a la práctica auténtica de la Umbanda,
            promoviendo el crecimiento espiritual y el servicio a la comunidad.
          </p>
        </motion.div>

        {/* Grid de imágenes con efecto hover */}
        <motion.div
          ref={galleryRef}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
          variants={galleryContainerVariants}
          initial="hidden"
          animate="visible"
        >
          {galleryImages.map((image, index) => (
            <motion.div
              key={index}
              variants={galleryItemVariants}
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.3 }}
              className="group relative overflow-hidden rounded-lg aspect-[4/3] shadow-xl"
            >
              <img
                src={image.url}
                alt={image.alt}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
                decoding="async"
                width="800"
                height="600"
              />
              {/* Overlay con título al hacer hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                <div className="p-6 w-full">
                  <h3 className="text-white text-xl font-semibold">{image.title}</h3>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Valores/Pilares del centro */}
        <motion.div
          ref={pillarsRef}
          className="grid md:grid-cols-3 gap-8 mt-16"
          initial="hidden"
          animate="visible"
          transition={{ staggerChildren: 0.2, delayChildren: 0.1 }}
        >
          {pillars.map((pillar, index) => (
            <motion.div
              key={index}
              variants={pillarVariants}
              whileHover={{
                y: -8,
                borderColor: "#16a34a",
                boxShadow: "0 10px 30px rgba(34, 197, 94, 0.2)"
              }}
              transition={{ duration: 0.3 }}
              className="text-center p-6 rounded-lg bg-gray-800/50 backdrop-blur-sm border border-gray-700"
            >
              <div className="text-5xl mb-4">{pillar.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-3">{pillar.title}</h3>
              <p className="text-gray-400 leading-relaxed">
                {pillar.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Breve descripción del templo */}
        <motion.div
          ref={descriptionRef}
          className="mt-16 max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <p className="text-lg text-gray-300 leading-relaxed mb-8">
            Fundado hace más de 15 años, el Centro Umbandista Reino Da Mata se ha
            consolidado como un espacio de referencia para la práctica de la Umbanda
            en Uruguay. Nuestro templo acoge a personas de todas las procedencias,
            unidas por el deseo de crecer espiritualmente y servir a la comunidad.
          </p>

          {/* CTA para conocer más */}
          <motion.a
            href="/nosotros"
            className="inline-block px-8 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-lg"
            whileHover={{
              scale: 1.05,
              boxShadow: "0 20px 40px rgba(34, 197, 94, 0.4)",
              backgroundColor: "#16a34a"
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            Conocer Nuestra Historia Completa →
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
