import { useState, useEffect } from 'react';
import { useAuth } from '@/core/hooks/useAuth';
import { getPersonalizedArticles } from '@/services/personalizationService';
import type { DocumentData } from 'firebase/firestore';

export default function PersonalizedFeed() {
  const { user, loading: authLoading } = useAuth();
  const [articles, setArticles] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) {
      // Esperar a que la autenticación se resuelva
      return;
    }

    async function fetchArticles() {
      if (!user) {
        setLoading(false);
        setError("Necesitas iniciar sesión para ver tu feed personalizado.");
        return;
      }

      try {
        setLoading(true);
        const personalizedArticles = await getPersonalizedArticles(user.uid);
        setArticles(personalizedArticles);
      } catch (err) {
        console.error(err);
        setError("Ocurrió un error al cargar tu feed. Por favor, intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    }

    fetchArticles();
  }, [user, authLoading]);

  if (loading || authLoading) {
    return (
      <div className="text-center p-8">
        <p className="text-lg text-gray-300">Cargando tu feed personalizado...</p>
        {/* Aquí podría ir un componente de esqueleto (skeleton) más elaborado */}
        <div className="mt-4 space-y-4">
          <div className="h-8 bg-gray-700 rounded w-3/4 mx-auto animate-pulse"></div>
          <div className="h-8 bg-gray-700 rounded w-1/2 mx-auto animate-pulse"></div>
          <div className="h-8 bg-gray-700 rounded w-5/6 mx-auto animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div className="bg-[#1f1e23] p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-[#F08F4A] mb-6">Artículos recomendados para ti</h2>
      {articles.length > 0 ? (
        <ul className="space-y-4">
          {articles.map((article) => (
            <li key={article.id} className="p-4 bg-[#2a292e] rounded-md hover:bg-gray-700 transition">
              <a href={`/blog/${article.slug}`} className="text-xl font-semibold text-white hover:text-[#F08F4A]">
                {article.title}
              </a>
              <p className="text-gray-400 text-sm mt-1">
                {article.tags && Array.isArray(article.tags) ? article.tags.join(', ') : ''}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-400">No hemos encontrado artículos basados en tus intereses. ¡Explora el blog para descubrir más!</p>
      )}
    </div>
  );
}
