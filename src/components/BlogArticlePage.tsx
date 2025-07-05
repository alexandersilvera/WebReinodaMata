import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '@/core/firebase/config';
import { marked } from 'marked';
import CommentSection from './CommentSection';

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
  draft?: boolean;
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
        
        // Obtener el artículo por slug (filtrar en memoria para evitar índices complejos)
        const articlesRef = collection(db, 'articles');
        const q = query(articlesRef, where('slug', '==', slug), limit(1));
        
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          setError('Artículo no encontrado');
          return;
        }
        
        const articleData = {
          id: querySnapshot.docs[0].id,
          ...querySnapshot.docs[0].data()
        } as Article;
        
        // Verificar que no sea borrador
        if (articleData.draft) {
          setError('Artículo no encontrado');
          return;
        }
        
        setArticle(articleData);
        
        // Cargar artículos relacionados (obtener todos y filtrar en memoria)
        const allArticlesQuery = query(articlesRef);
        
        const allArticlesSnapshot = await getDocs(allArticlesQuery);
        const allArticles = allArticlesSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as Article))
          .filter(a => a.slug !== slug && !a.draft); // Filtrar borradores y artículo actual
        
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
      <div className="min-h-screen bg-dark-blue flex justify-center items-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-extra-soft-white border-t-green-400 mx-auto"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400/20 to-green-600/20 animate-pulse"></div>
          </div>
          <p className="mt-8 text-soft-white text-xl font-medium">Cargando artículo...</p>
          <p className="mt-2 text-extra-soft-white">Preparando el contenido para ti</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-dark-blue flex justify-center items-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 mx-auto mb-8 bg-red-500/10 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-soft-white mb-2">Artículo no encontrado</h1>
          <p className="text-red-400 mb-8">{error || 'El artículo que buscas no existe o ha sido eliminado'}</p>
          <a 
            href="/blog" 
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white font-medium rounded-lg hover:from-green-700 hover:to-green-600 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
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
    <div className="min-h-screen bg-dark-blue">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <nav className="max-w-4xl mx-auto mb-8">
          <a 
            href="/blog" 
            className="inline-flex items-center text-green-400 hover:text-green-300 transition-colors duration-200 group"
          >
            <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Volver al Blog
          </a>
        </nav>

        {/* Article Header */}
        <header className="max-w-4xl mx-auto mb-12">
          {/* Featured Image */}
          {article.image && (
            <div className="relative mb-8 rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src={article.image} 
                alt={article.title}
                className="w-full h-64 md:h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-blue/60 via-transparent to-transparent"></div>
            </div>
          )}
          
          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-green-400 via-green-300 to-green-500 bg-clip-text text-transparent mb-6 leading-tight">
            {article.title}
          </h1>
          
          {/* Description */}
          <p className="text-xl text-soft-white mb-8 leading-relaxed">
            {article.description}
          </p>
          
          {/* Article Meta */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 p-6 bg-soft-light rounded-xl border border-extra-soft-white/10">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                <span className="text-dark-blue text-lg font-bold">{article.author.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <p className="text-soft-white font-semibold">{article.author}</p>
                <p className="text-extra-soft-white text-sm">Autor</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-extra-soft-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <time dateTime={publishDate.toISOString()}>
                {publishDate.toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>
            </div>
          </div>
          
          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-8">
              {article.tags.map((tag) => (
                <span 
                  key={tag}
                  className="px-4 py-2 bg-green-500/10 text-green-400 font-medium rounded-full border border-green-500/20 hover:bg-green-500/20 transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Article Content */}
        <article className="max-w-4xl mx-auto">
          <div className="bg-soft-light rounded-2xl p-8 md:p-12 border border-extra-soft-white/10 shadow-xl">
            <div 
              className="prose prose-invert prose-green prose-lg max-w-none [&>h1]:text-green-400 [&>h2]:text-green-300 [&>h3]:text-green-300 [&>h4]:text-green-300 [&>p]:text-soft-white [&>p]:leading-relaxed [&>ul]:text-soft-white [&>ol]:text-soft-white [&>blockquote]:border-l-green-400 [&>blockquote]:bg-green-500/5 [&>blockquote]:text-green-200 [&>a]:text-green-400 [&>a]:no-underline hover:[&>a]:text-green-300 [&>code]:bg-green-500/10 [&>code]:text-green-300 [&>code]:px-2 [&>code]:py-1 [&>code]:rounded"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          </div>
        </article>

        {/* Comments Section */}
        <div className="max-w-4xl mx-auto mt-12">
          <CommentSection postId={article.id} postTitle={article.title} />
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="max-w-6xl mx-auto mt-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent mb-4">
                Artículos Relacionados
              </h2>
              <p className="text-extra-soft-white">Descubre más contenido que te puede interesar</p>
              <div className="mt-4 w-16 h-1 bg-gradient-to-r from-green-600 to-green-300 mx-auto rounded-full"></div>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {relatedArticles.map((related, index) => {
                const relatedDate = related.publishDate?.toDate ? 
                  related.publishDate.toDate() : 
                  new Date(related.publishDate);

                return (
                  <article 
                    key={related.id} 
                    className="group bg-soft-light rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-extra-soft-white/10 hover:border-green-400/30"
                    style={{
                      animationDelay: `${index * 150}ms`
                    }}
                  >
                    {/* Related Article Image */}
                    <div className="relative overflow-hidden">
                      {related.image ? (
                        <img 
                          src={related.image} 
                          alt={related.title}
                          className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gradient-to-br from-green-600/20 to-green-400/10 flex items-center justify-center">
                          <svg className="w-12 h-12 text-green-400/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                          </svg>
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-soft-light/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      <div className="absolute top-4 right-4 bg-green-500/90 backdrop-blur-sm text-dark-blue text-xs font-semibold px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        Leer
                      </div>
                    </div>

                    {/* Related Article Content */}
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-soft-white mb-2 line-clamp-2 group-hover:text-green-300 transition-colors duration-300">
                        <a href={`/blog/${related.slug}`} className="block">
                          {related.title}
                        </a>
                      </h3>
                      
                      <p className="text-extra-soft-white mb-4 text-sm line-clamp-3 leading-relaxed">
                        {related.description}
                      </p>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-extra-soft-white/10">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                            <span className="text-dark-blue text-xs font-bold">{related.author.charAt(0).toUpperCase()}</span>
                          </div>
                          <span className="text-extra-soft-white text-xs font-medium">{related.author}</span>
                        </div>
                        
                        <time 
                          dateTime={relatedDate.toISOString()}
                          className="text-extra-soft-white text-xs"
                        >
                          {relatedDate.toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short'
                          })}
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