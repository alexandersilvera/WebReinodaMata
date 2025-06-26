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
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        <span className="ml-3 text-gray-300">Cargando artículos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Recargar
        </button>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No hay artículos publicados aún.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => {
        const publishDate = article.publishDate?.toDate ? 
          article.publishDate.toDate() : 
          new Date(article.publishDate);

        return (
          <article key={article.id} className="bg-gray-900 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
            {article.image && (
              <img 
                src={article.image} 
                alt={article.title}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-6">
              <h3 className="text-xl font-semibold text-green-400 mb-2">
                <a href={`/blog/${article.slug}`} className="hover:text-green-300 transition-colors">
                  {article.title}
                </a>
              </h3>
              <p className="text-gray-300 mb-4 line-clamp-3">{article.description}</p>
              
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>{article.author}</span>
                <time dateTime={publishDate.toISOString()}>
                  {publishDate.toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </time>
              </div>
              
              {article.tags && article.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <span 
                      key={tag}
                      className="px-2 py-1 bg-green-900 text-green-300 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}