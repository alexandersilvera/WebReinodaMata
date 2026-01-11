/**
 * Componente de Últimos Artículos del Blog para Landing Page
 * Muestra los últimos 2 artículos en cards grandes y destacadas
 *
 * Actualización Enero 2026:
 * - Animaciones Framer Motion (staggered, fade-in)
 * - Intersection Observer para lazy animations
 * - Hover effects mejorados
 */
import { useEffect, useState, useRef } from 'react';
import { motion, useInView, type Variants } from 'framer-motion';
import type { Article } from '@/core/types';
import { SkeletonArticleCard } from '@/components/Loading';

// Variantes de animación para el contenedor
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.2
    }
  }
};

// Variantes de animación para items individuales
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.7,
      ease: [0.6, 0.05, 0.01, 0.9] as const
    }
  }
};

export default function LatestBlogPosts() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  useEffect(() => {
    let cancelled = false;

    async function waitForServices(): Promise<boolean> {
      // Esperar hasta que los servicios estén disponibles (máx 5 segundos)
      const maxAttempts = 50; // 50 intentos x 100ms = 5 segundos
      for (let i = 0; i < maxAttempts; i++) {
        if (cancelled) return false;
        if (window.articleServices) {
          console.log('[LatestBlogPosts] Servicios disponibles después de', i * 100, 'ms');
          return true;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      console.error('[LatestBlogPosts] Timeout esperando servicios');
      return false;
    }

    async function loadArticles() {
      try {
        setLoading(true);

        console.log('[LatestBlogPosts] Esperando servicios...');
        const servicesAvailable = await waitForServices();

        if (!servicesAvailable || cancelled) {
          if (!cancelled) {
            setError('Servicios no disponibles');
          }
          return;
        }

        const allArticles = await window.articleServices.getAllArticles({
          includeDrafts: false,
          limitCount: 2
        });

        if (!cancelled) {
          console.log('[LatestBlogPosts] Artículos cargados:', allArticles);
          setArticles(allArticles || []);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('[LatestBlogPosts] Error cargando artículos:', err);
          setError('No se pudieron cargar los artículos');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadArticles();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Últimos Artículos
            </h2>
            <div className="w-24 h-1 bg-green-600 mx-auto mb-6"></div>
          </div>

          {/* Loading Skeleton - Usando componente reutilizable */}
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {[1, 2].map((i) => (
              <SkeletonArticleCard key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || articles.length === 0) {
    return (
      <section className="py-20 bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Últimos Artículos
            </h2>
            <div className="w-24 h-1 bg-green-600 mx-auto mb-6"></div>
            <p className="text-xl text-gray-400">
              {error || 'No hay artículos publicados por el momento'}
            </p>
            <a
              href="/blog"
              className="inline-block mt-8 px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg transition-all"
            >
              Visitar el Blog
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="py-20 bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Título de la sección */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Últimos Artículos
          </h2>
          <div className="w-24 h-1 bg-green-600 mx-auto mb-6"></div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Conocimiento, reflexiones y enseñanzas sobre la Umbanda
          </p>
        </motion.div>

        {/* Grid de artículos - 2 cards grandes con animaciones staggered */}
        <motion.div
          className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-12"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {articles.map((article) => (
            <motion.div key={article.id} variants={itemVariants}>
              <ArticleCard article={article} />
            </motion.div>
          ))}
        </motion.div>

        {/* CTA para ver todos los artículos */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <motion.a
            href="/blog"
            className="inline-block px-8 py-4 bg-green-600 text-white font-semibold rounded-lg text-lg shadow-lg"
            whileHover={{
              scale: 1.05,
              boxShadow: "0 20px 40px rgba(34, 197, 94, 0.4)",
              backgroundColor: "#16a34a"
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            Ver Todos los Artículos →
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}

/**
 * Card individual de artículo - Diseño grande y destacado con animaciones
 */
function ArticleCard({ article }: { article: Article }) {
  // Formatear fecha - puede estar en publishDate, publishedAt o pubDate
  const dateValue = (article as any).publishDate || (article as any).publishedAt || article.pubDate;
  const publishDate = dateValue instanceof Date
    ? dateValue
    : dateValue?.toDate?.() || new Date(dateValue || Date.now());

  const formattedDate = new Intl.DateTimeFormat('es-UY', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(publishDate);

  // Calcular tiempo de lectura (estimado: 200 palabras por minuto)
  const readingTime = article.content
    ? Math.ceil(article.content.split(/\s+/).length / 200)
    : 5;

  // Obtener imagen (puede estar en image, heroImage o imageUrl)
  const articleImage = article.image || article.heroImage || (article as any).imageUrl;

  return (
    <motion.article
      className="bg-gray-800 rounded-xl overflow-hidden shadow-2xl border border-gray-700"
      whileHover={{
        y: -8,
        boxShadow: "0 25px 50px -12px rgba(34, 197, 94, 0.25)",
        borderColor: "#16a34a"
      }}
      transition={{ duration: 0.3 }}
    >
      {/* Imagen destacada */}
      {articleImage ? (
        <div className="relative h-64 overflow-hidden">
          <img
            src={articleImage}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
            decoding="async"
            width="800"
            height="600"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-800 via-transparent to-transparent"></div>

          {/* Categoría badge */}
          {(article as any).category && (
            <div className="absolute top-4 left-4 bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
              {(article as any).category}
            </div>
          )}
        </div>
      ) : (
        <div className="h-64 bg-gradient-to-br from-green-900 via-gray-800 to-gray-900 flex items-center justify-center">
          <div className="text-8xl">📚</div>
        </div>
      )}

      {/* Contenido */}
      <div className="p-8">
        {/* Metadata: Fecha y tiempo de lectura */}
        <div className="flex items-center text-gray-400 text-sm mb-4 space-x-4">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formattedDate}
          </div>
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {readingTime} min de lectura
          </div>
        </div>

        {/* Título */}
        <a href={`/blog/${article.slug}`}>
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 group-hover:text-green-400 transition-colors line-clamp-2">
            {article.title}
          </h3>
        </a>

        {/* Extracto/Descripción */}
        {(article.description || (article as any).excerpt) && (
          <p className="text-gray-300 text-base leading-relaxed mb-6 line-clamp-3">
            {article.description || (article as any).excerpt}
          </p>
        )}

        {/* Autor y CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-700">
          {article.author && (
            <div className="flex items-center text-gray-400 text-sm">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                {article.author.charAt(0).toUpperCase()}
              </div>
              <span>Por {article.author}</span>
            </div>
          )}

          <motion.a
            href={`/blog/${article.slug}`}
            className="text-green-400 hover:text-green-300 font-semibold text-sm flex items-center"
            whileHover={{ x: 8 }}
            transition={{ duration: 0.2 }}
          >
            Leer más
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </motion.a>
        </div>
      </div>
    </motion.article>
  );
}
