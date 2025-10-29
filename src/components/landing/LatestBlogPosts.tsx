/**
 * Componente de Últimos Artículos del Blog para Landing Page
 * Muestra los últimos 2 artículos en cards grandes y destacadas
 */
import { useEffect, useState } from 'react';
import type { Article } from '@/features/blog/types';

export default function LatestBlogPosts() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadArticles() {
      try {
        setLoading(true);

        console.log('[LatestBlogPosts] Iniciando carga de artículos...');
        console.log('[LatestBlogPosts] window.articleServices:', window.articleServices);

        if (!window.articleServices) {
          console.error('[LatestBlogPosts] articleServices no está disponible en window');
          setError('Servicios no disponibles');
          return;
        }

        const allArticles = await window.articleServices.getAllArticles({
          includeDrafts: false,
          limitCount: 2
        });
        console.log('[LatestBlogPosts] Artículos cargados:', allArticles);

        setArticles(allArticles || []);
      } catch (err) {
        console.error('[LatestBlogPosts] Error cargando artículos:', err);
        setError('No se pudieron cargar los artículos');
      } finally {
        setLoading(false);
      }
    }

    // Esperar un poco para asegurar que globalServices se haya cargado
    const timer = setTimeout(() => {
      loadArticles();
    }, 100);

    return () => clearTimeout(timer);
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

          {/* Loading Skeleton */}
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {[1, 2].map((i) => (
              <div key={i} className="bg-gray-800 rounded-lg overflow-hidden animate-pulse">
                <div className="h-64 bg-gray-700"></div>
                <div className="p-8">
                  <div className="h-4 bg-gray-700 rounded mb-4"></div>
                  <div className="h-8 bg-gray-700 rounded mb-4"></div>
                  <div className="h-4 bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                </div>
              </div>
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
    <section className="py-20 bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Título de la sección */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Últimos Artículos
          </h2>
          <div className="w-24 h-1 bg-green-600 mx-auto mb-6"></div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Conocimiento, reflexiones y enseñanzas sobre la Umbanda
          </p>
        </div>

        {/* Grid de artículos - 2 cards grandes */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-12">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>

        {/* CTA para ver todos los artículos */}
        <div className="text-center">
          <a
            href="/blog"
            className="inline-block px-8 py-4 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg text-lg transition-all transform hover:scale-105 shadow-lg"
          >
            Ver Todos los Artículos →
          </a>
        </div>
      </div>
    </section>
  );
}

/**
 * Card individual de artículo - Diseño grande y destacado
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
    <article className="group bg-gray-800 rounded-xl overflow-hidden shadow-2xl hover:shadow-green-900/20 transition-all transform hover:-translate-y-2 border border-gray-700 hover:border-green-600">
      {/* Imagen destacada */}
      {articleImage ? (
        <div className="relative h-64 overflow-hidden">
          <img
            src={articleImage}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
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

          <a
            href={`/blog/${article.slug}`}
            className="text-green-400 hover:text-green-300 font-semibold text-sm flex items-center group-hover:translate-x-2 transition-transform"
          >
            Leer más
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </article>
  );
}
