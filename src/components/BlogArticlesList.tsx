import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/core/firebase/config';

interface Article {
  id: string;
  title: string;
  description: string;
  slug: string;
  image: string;
  tags: string[];
  author: string;
  publishDate: any;
  draft?: boolean;
}

export default function BlogArticlesList() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadArticles = async () => {
      try {
        setLoading(true);
        
        // Obtener artículos desde Firestore (filtrar en memoria para evitar índices complejos)
        const articlesRef = collection(db, 'articles');
        const q = query(articlesRef, orderBy('publishDate', 'desc'));
        
        const querySnapshot = await getDocs(q);
        const articlesData = querySnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Article))
          .filter(article => !article.draft); // Filtrar borradores en memoria
        
        setArticles(articlesData);
      } catch (err) {
        console.error('Error loading articles:', err);
        setError('Error al cargar los artículos');
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-extra-soft-white border-t-green-400 mx-auto"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400/20 to-green-600/20 animate-pulse"></div>
          </div>
          <p className="mt-6 text-soft-white text-lg font-medium">Cargando artículos...</p>
          <p className="mt-2 text-extra-soft-white text-sm">Preparando el contenido para ti</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-500/10 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-soft-white mb-2">Error al cargar artículos</h3>
          <p className="text-red-400 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white font-medium rounded-lg hover:from-green-700 hover:to-green-600 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            Recargar
          </button>
        </div>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 mx-auto mb-6 bg-soft-light rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-extra-soft-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-soft-white mb-2">No hay artículos aún</h3>
          <p className="text-extra-soft-white">Pronto publicaremos contenido interesante para ti.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
      {articles.map((article, index) => {
        const publishDate = article.publishDate?.toDate ? 
          article.publishDate.toDate() : 
          new Date(article.publishDate);

        return (
          <article 
            key={article.id} 
            className="group bg-soft-light rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-extra-soft-white/10 hover:border-green-400/30"
            style={{
              animationDelay: `${index * 100}ms`
            }}
          >
            {/* Imagen del artículo */}
            <div className="relative overflow-hidden">
              {article.image ? (
                <img 
                  src={article.image} 
                  alt={article.title}
                  className="w-full h-52 object-cover transition-transform duration-700 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-52 bg-gradient-to-br from-green-600/20 to-green-400/10 flex items-center justify-center">
                  <svg className="w-16 h-16 text-green-400/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </div>
              )}
              
              {/* Overlay gradiente */}
              <div className="absolute inset-0 bg-gradient-to-t from-soft-light/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Indicador de lectura */}
              <div className="absolute top-4 right-4 bg-green-500/90 backdrop-blur-sm text-dark-blue text-xs font-semibold px-3 py-1.5 rounded-full">
                Leer artículo
              </div>
            </div>

            {/* Contenido */}
            <div className="p-6">
              {/* Título */}
              <h3 className="text-xl font-bold text-soft-white mb-3 line-clamp-2 group-hover:text-green-300 transition-colors duration-300">
                <a href={`/blog/${article.slug}`} className="block">
                  {article.title}
                </a>
              </h3>
              
              {/* Descripción */}
              <p className="text-extra-soft-white mb-4 line-clamp-3 leading-relaxed text-sm">
                {article.description}
              </p>
              
              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {article.tags.slice(0, 3).map((tag) => (
                    <span 
                      key={tag}
                      className="px-3 py-1 bg-green-500/10 text-green-400 text-xs font-medium rounded-full border border-green-500/20 hover:bg-green-500/20 transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                  {article.tags.length > 3 && (
                    <span className="px-3 py-1 bg-extra-soft-white/10 text-extra-soft-white text-xs rounded-full">
                      +{article.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
              
              {/* Footer del artículo */}
              <div className="flex items-center justify-between pt-4 border-t border-extra-soft-white/10">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                    <span className="text-dark-blue text-xs font-bold">{article.author.charAt(0).toUpperCase()}</span>
                  </div>
                  <span className="text-extra-soft-white text-sm font-medium">{article.author}</span>
                </div>
                
                <time 
                  dateTime={publishDate.toISOString()}
                  className="text-extra-soft-white text-xs"
                >
                  {publishDate.toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </time>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}