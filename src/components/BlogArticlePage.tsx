import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '@/core/firebase/config';
import { marked } from 'marked';

interface Article {
  id: string;
  title: string;
  description: string;
  slug: string;
  content: string;
  image: string;
  tags: string[];
  author: string;
  publishDate: any;
}

interface BlogArticlePageProps {
  slug: string;
}

export default function BlogArticlePage({ slug }: BlogArticlePageProps) {
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadArticle = async () => {
      try {
        setLoading(true);
        
        // Obtener el artículo por slug
        const articlesRef = collection(db, 'articles');
        const q = query(
          articlesRef,
          where('slug', '==', slug),
          where('draft', '==', false),
          limit(1)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          setError('Artículo no encontrado');
          return;
        }
        
        const articleData = {
          id: querySnapshot.docs[0].id,
          ...querySnapshot.docs[0].data()
        } as Article;
        
        setArticle(articleData);
        
        // Cargar artículos relacionados
        const allArticlesQuery = query(
          articlesRef,
          where('draft', '==', false)
        );
        
        const allArticlesSnapshot = await getDocs(allArticlesQuery);
        const allArticles = allArticlesSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as Article))
          .filter(a => a.slug !== slug);
        
        // Encontrar artículos relacionados por tags
        const related = allArticles
          .filter(a => a.tags.some(tag => articleData.tags.includes(tag)))
          .slice(0, 3);
        
        // Si no hay suficientes relacionados, agregar aleatorios
        if (related.length < 3) {
          const remaining = allArticles
            .filter(a => !related.some(r => r.id === a.id))
            .sort(() => Math.random() - 0.5)
            .slice(0, 3 - related.length);
          related.push(...remaining);
        }
        
        setRelatedArticles(related);
        
      } catch (err) {
        console.error('Error loading article:', err);
        setError('Error al cargar el artículo');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadArticle();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        <span className="ml-3 text-gray-300">Cargando artículo...</span>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-black text-white flex justify-center items-center">
        <div className="text-center">
          <h1 className="text-2xl text-red-400 mb-4">{error || 'Artículo no encontrado'}</h1>
          <a href="/blog" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            Volver al Blog
          </a>
        </div>
      </div>
    );
  }

  const publishDate = article.publishDate?.toDate ? 
    article.publishDate.toDate() : 
    new Date(article.publishDate);

  const htmlContent = marked(article.content);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        {/* Header del artículo */}
        <header className="max-w-4xl mx-auto mb-12">
          <nav className="mb-6">
            <a href="/blog" className="text-green-400 hover:text-green-300 transition-colors">
              ← Volver al Blog
            </a>
          </nav>
          
          {article.image && (
            <img 
              src={article.image} 
              alt={article.title}
              className="w-full h-64 md:h-96 object-cover rounded-lg mb-8"
            />
          )}
          
          <h1 className="text-4xl md:text-5xl font-bold text-green-400 mb-6">
            {article.title}
          </h1>
          
          <div className="flex items-center justify-between text-gray-400 mb-6">
            <span>Por {article.author}</span>
            <time dateTime={publishDate.toISOString()}>
              {publishDate.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </time>
          </div>
          
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {article.tags.map((tag) => (
                <span 
                  key={tag}
                  className="px-3 py-1 bg-green-900 text-green-300 text-sm rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          <p className="text-xl text-gray-300 mb-8">{article.description}</p>
        </header>

        {/* Contenido del artículo */}
        <article className="max-w-4xl mx-auto">
          <div 
            className="prose prose-invert prose-green prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </article>

        {/* Artículos relacionados */}
        {relatedArticles.length > 0 && (
          <section className="max-w-6xl mx-auto mt-16 pt-10 border-t border-green-900/30">
            <h2 className="text-2xl font-bold text-green-400 mb-8">Artículos relacionados</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {relatedArticles.map((related) => {
                const relatedDate = related.publishDate?.toDate ? 
                  related.publishDate.toDate() : 
                  new Date(related.publishDate);

                return (
                  <article key={related.id} className="bg-gray-900 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                    {related.image && (
                      <img 
                        src={related.image} 
                        alt={related.title}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-green-400 mb-2">
                        <a href={`/blog/${related.slug}`} className="hover:text-green-300 transition-colors">
                          {related.title}
                        </a>
                      </h3>
                      <p className="text-gray-300 mb-4 text-sm line-clamp-3">{related.description}</p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>{related.author}</span>
                        <time dateTime={relatedDate.toISOString()}>
                          {relatedDate.toLocaleDateString('es-ES')}
                        </time>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}