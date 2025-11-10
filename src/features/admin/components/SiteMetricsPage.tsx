/**
 * Componente de página de métricas del sitio web
 * Muestra estadísticas de visitas, suscriptores, artículos y comentarios
 */

import React, { useState, useEffect, useRef } from 'react';
import { db } from '@/core/firebase/config';
import { collection, getDocs, query, orderBy, where, Timestamp } from 'firebase/firestore';
import { Chart, registerables } from 'chart.js';

// Registrar componentes de Chart.js
Chart.register(...registerables);

interface ChartData {
  labels: string[];
  data: number[];
}

interface MetricsData {
  totalVisits: number;
  totalSubscribers: number;
  totalArticles: number;
  totalComments: number;
  visitsPerDay: ChartData;
  subscribersPerDay: ChartData;
  popularArticles: any[];
}

interface Article {
  id: string;
  title: string;
  slug: string;
  publishDate: any;
  visits: number;
}

const SiteMetricsPage: React.FC = () => {
  // Estado
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState(365); // Días por defecto
  const [metricsData, setMetricsData] = useState<MetricsData>({
    totalVisits: 0,
    totalSubscribers: 0,
    totalArticles: 0,
    totalComments: 0,
    visitsPerDay: { labels: [], data: [] },
    subscribersPerDay: { labels: [], data: [] },
    popularArticles: []
  });

  // Referencias a los gráficos
  const visitsChartRef = useRef<HTMLCanvasElement>(null);
  const subscribersChartRef = useRef<HTMLCanvasElement>(null);
  const visitsChartInstance = useRef<Chart | null>(null);
  const subscribersChartInstance = useRef<Chart | null>(null);

  // Función para procesar visitas por día
  const processVisitsByDay = (visits: any[]): ChartData => {
    const dateMap: Record<string, number> = {};
    const today = new Date();

    // Inicializar los últimos días con 0 visitas
    for (let i = 0; i < Math.min(selectedPeriod, 365); i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dateMap[dateStr] = 0;
    }

    // Agregar visitas a los días correspondientes
    visits.forEach(visit => {
      if (visit.timestamp?.toDate) {
        const timestamp = visit.timestamp.toDate();
        const dateStr = timestamp.toISOString().split('T')[0];
        if (dateMap[dateStr] !== undefined) {
          dateMap[dateStr]++;
        }
      }
    });

    // Convertir a array para Chart.js
    const sortedDates = Object.keys(dateMap).sort();

    // Limitar la cantidad de días mostrados para periodos largos
    const displayLimit = 30; // Mostrar máximo 30 días en el gráfico
    const step = Math.max(1, Math.floor(sortedDates.length / displayLimit));

    const labels: string[] = [];
    const data: number[] = [];

    for (let i = sortedDates.length - 1; i >= 0; i -= step) {
      const date = new Date(sortedDates[i]);
      labels.unshift(date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }));
      data.unshift(dateMap[sortedDates[i]]);
    }

    return { labels, data };
  };

  // Función para procesar suscriptores por día
  const processSubscribersByDay = (subscribers: any[]): ChartData => {
    const dateMap: Record<string, number> = {};
    const today = new Date();

    // Inicializar los últimos días con 0 suscriptores
    for (let i = 0; i < Math.min(selectedPeriod, 365); i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dateMap[dateStr] = 0;
    }

    // Agregar suscriptores a los días correspondientes
    subscribers.forEach(subscriber => {
      if (subscriber.createdAt?.toDate) {
        const timestamp = subscriber.createdAt.toDate();
        const dateStr = timestamp.toISOString().split('T')[0];
        if (dateMap[dateStr] !== undefined) {
          dateMap[dateStr]++;
        }
      }
    });

    // Convertir a array para Chart.js
    const sortedDates = Object.keys(dateMap).sort();

    // Limitar la cantidad de días mostrados para periodos largos
    const displayLimit = 30;
    const step = Math.max(1, Math.floor(sortedDates.length / displayLimit));

    const labels: string[] = [];
    const data: number[] = [];

    for (let i = sortedDates.length - 1; i >= 0; i -= step) {
      const date = new Date(sortedDates[i]);
      labels.unshift(date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }));
      data.unshift(dateMap[sortedDates[i]]);
    }

    return { labels, data };
  };

  // Función para procesar artículos más populares
  const processPopularArticles = (articles: any[], visits: any[]): Article[] => {
    // Contar visitas por artículo
    const articleVisits: Record<string, number> = {};
    visits.forEach(visit => {
      if (visit.path && visit.path.startsWith('/blog/')) {
        const slug = visit.path.replace('/blog/', '');
        articleVisits[slug] = (articleVisits[slug] || 0) + 1;
      }
    });

    // Mapear los datos de artículos con sus visitas
    const articlesWithVisits = articles.map(article => ({
      ...article,
      visits: articleVisits[article.slug] || 0
    }));

    // Ordenar por número de visitas
    return articlesWithVisits.sort((a, b) => b.visits - a.visits);
  };

  // Función para cargar métricas
  const loadMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Calcular la fecha límite según el periodo seleccionado
      const now = new Date();
      const limitDate = new Date(now);
      limitDate.setDate(limitDate.getDate() - selectedPeriod);
      const limitTimestamp = Timestamp.fromDate(limitDate);

      // Obtener visitas
      const visitsRef = collection(db, "pageViews");
      let visitsQuery = query(visitsRef, orderBy("timestamp", "desc"));

      if (selectedPeriod !== 9999) {
        visitsQuery = query(visitsRef, where("timestamp", ">=", limitTimestamp), orderBy("timestamp", "desc"));
      }

      const visitsSnapshot = await getDocs(visitsQuery);
      const visits: any[] = [];
      visitsSnapshot.forEach(doc => visits.push(doc.data()));

      // Obtener suscriptores
      const subscribersRef = collection(db, "subscribers");
      let subscribersQuery = query(subscribersRef, orderBy("createdAt", "desc"));

      if (selectedPeriod !== 9999) {
        subscribersQuery = query(subscribersRef, where("createdAt", ">=", limitTimestamp), orderBy("createdAt", "desc"));
      }

      const subscribersSnapshot = await getDocs(subscribersQuery);
      const subscribers: any[] = [];
      subscribersSnapshot.forEach(doc => subscribers.push(doc.data()));

      // Obtener artículos
      const articlesRef = collection(db, "articles");
      let articlesQuery = query(articlesRef, orderBy("publishDate", "desc"));

      if (selectedPeriod !== 9999) {
        articlesQuery = query(articlesRef, where("publishDate", ">=", limitTimestamp), orderBy("publishDate", "desc"));
      }

      const articlesSnapshot = await getDocs(articlesQuery);
      const articles: any[] = [];
      articlesSnapshot.forEach(doc => articles.push({
        id: doc.id,
        ...doc.data()
      }));

      // Obtener comentarios
      const commentsRef = collection(db, "comments");
      let commentsQuery = query(commentsRef, orderBy("createdAt", "desc"));

      if (selectedPeriod !== 9999) {
        commentsQuery = query(commentsRef, where("createdAt", ">=", limitTimestamp), orderBy("createdAt", "desc"));
      }

      const commentsSnapshot = await getDocs(commentsQuery);
      const comments: any[] = [];
      commentsSnapshot.forEach(doc => comments.push(doc.data()));

      // Procesar datos
      const visitsByDay = processVisitsByDay(visits);
      const subscribersByDay = processSubscribersByDay(subscribers);
      const popularArticles = processPopularArticles(articles, visits);

      // Actualizar estado
      setMetricsData({
        totalVisits: visits.length,
        totalSubscribers: subscribers.length,
        totalArticles: articles.length,
        totalComments: comments.length,
        visitsPerDay: visitsByDay,
        subscribersPerDay: subscribersByDay,
        popularArticles: popularArticles.slice(0, 5) // Top 5
      });
    } catch (err) {
      console.error("Error al cargar métricas:", err);
      setError("Error al cargar las métricas. Por favor, intenta de nuevo más tarde.");
    } finally {
      setLoading(false);
    }
  };

  // Cargar métricas cuando cambia el periodo
  useEffect(() => {
    loadMetrics();
  }, [selectedPeriod]);

  // Renderizar gráficos cuando cambian los datos
  useEffect(() => {
    if (!loading && metricsData.visitsPerDay.labels.length > 0) {
      // Gráfico de visitas
      if (visitsChartRef.current) {
        // Destruir gráfico existente
        if (visitsChartInstance.current) {
          visitsChartInstance.current.destroy();
        }

        // Crear nuevo gráfico
        const ctx = visitsChartRef.current.getContext('2d');
        if (ctx) {
          visitsChartInstance.current = new Chart(ctx, {
            type: 'line',
            data: {
              labels: metricsData.visitsPerDay.labels,
              datasets: [{
                label: 'Visitas',
                data: metricsData.visitsPerDay.data,
                borderColor: '#10B981',
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                tension: 0.3,
                fill: true,
                pointBackgroundColor: '#10B981',
                pointRadius: 3,
                pointHoverRadius: 5
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                  },
                  ticks: {
                    color: 'rgba(255, 255, 255, 0.7)'
                  }
                },
                x: {
                  grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                  },
                  ticks: {
                    color: 'rgba(255, 255, 255, 0.7)'
                  }
                }
              }
            }
          });
        }
      }

      // Gráfico de suscriptores
      if (subscribersChartRef.current) {
        // Destruir gráfico existente
        if (subscribersChartInstance.current) {
          subscribersChartInstance.current.destroy();
        }

        // Crear nuevo gráfico
        const ctx = subscribersChartRef.current.getContext('2d');
        if (ctx) {
          subscribersChartInstance.current = new Chart(ctx, {
            type: 'bar',
            data: {
              labels: metricsData.subscribersPerDay.labels,
              datasets: [{
                label: 'Nuevos suscriptores',
                data: metricsData.subscribersPerDay.data,
                backgroundColor: '#10B981',
                borderRadius: 4
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                  },
                  ticks: {
                    color: 'rgba(255, 255, 255, 0.7)',
                    stepSize: 1
                  }
                },
                x: {
                  grid: {
                    display: false
                  },
                  ticks: {
                    color: 'rgba(255, 255, 255, 0.7)'
                  }
                }
              }
            }
          });
        }
      }
    }

    // Cleanup: destruir gráficos al desmontar
    return () => {
      if (visitsChartInstance.current) {
        visitsChartInstance.current.destroy();
      }
      if (subscribersChartInstance.current) {
        subscribersChartInstance.current.destroy();
      }
    };
  }, [loading, metricsData]);

  // Formatear fecha
  const formatDate = (timestamp: any): string => {
    if (!timestamp) return "Fecha desconocida";

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  // Obtener texto del periodo
  const getPeriodText = (): string => {
    if (selectedPeriod === 9999) return 'Todo el tiempo';
    if (selectedPeriod === 365) return 'Último año';
    if (selectedPeriod === 90) return 'Últimos 3 meses';
    if (selectedPeriod === 30) return 'Últimos 30 días';
    return 'Últimos 7 días';
  };

  if (error) {
    return (
      <div className="bg-red-600/80 text-white p-4 rounded-md text-center my-4">
        <p className="font-medium">Error al cargar las métricas</p>
        <p className="text-sm mt-1">{error}</p>
        <button
          onClick={() => loadMetrics()}
          className="mt-3 px-4 py-2 bg-white text-red-600 rounded hover:bg-gray-100 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto w-full px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-green-700 mb-2">Métricas y Análisis</h1>
          <p className="text-gray-200">Visualiza estadísticas e interacciones de los usuarios.</p>
        </div>
        <a href="/admin" className="text-green-400 hover:text-green-300 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          <span>Volver al panel</span>
        </a>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <svg className="animate-spin h-10 w-10 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="ml-3 text-green-300">Cargando métricas...</span>
        </div>
      ) : (
        <>
          {/* Selector de periodos */}
          <div className="mb-6 flex justify-center">
            <div className="bg-green-900/30 p-2 rounded-lg backdrop-blur-sm inline-flex space-x-1">
              {[
                { label: '7 días', value: 7 },
                { label: '30 días', value: 30 },
                { label: '3 meses', value: 90 },
                { label: '1 año', value: 365 },
                { label: 'Todo', value: 9999 }
              ].map((period) => (
                <button
                  key={period.value}
                  onClick={() => setSelectedPeriod(period.value)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedPeriod === period.value
                      ? 'bg-green-700 text-white'
                      : 'text-green-300 hover:bg-green-800/50 hover:text-white'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tarjetas de métricas generales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-green-900/30 p-6 rounded-lg backdrop-blur-sm text-center">
              <div className="text-4xl font-bold text-green-500">{metricsData.totalVisits}</div>
              <div className="text-sm text-gray-300 mt-2">Visitas totales</div>
              <div className="text-xs text-gray-400 mt-1">{getPeriodText()}</div>
            </div>

            <div className="bg-green-900/30 p-6 rounded-lg backdrop-blur-sm text-center">
              <div className="text-4xl font-bold text-green-500">{metricsData.totalSubscribers}</div>
              <div className="text-sm text-gray-300 mt-2">Suscriptores</div>
              <div className="text-xs text-gray-400 mt-1">{getPeriodText()}</div>
            </div>

            <div className="bg-green-900/30 p-6 rounded-lg backdrop-blur-sm text-center">
              <div className="text-4xl font-bold text-green-500">{metricsData.totalArticles}</div>
              <div className="text-sm text-gray-300 mt-2">Artículos publicados</div>
              <div className="text-xs text-gray-400 mt-1">{getPeriodText()}</div>
            </div>

            <div className="bg-green-900/30 p-6 rounded-lg backdrop-blur-sm text-center">
              <div className="text-4xl font-bold text-green-500">{metricsData.totalComments}</div>
              <div className="text-sm text-gray-300 mt-2">Comentarios</div>
              <div className="text-xs text-gray-400 mt-1">{getPeriodText()}</div>
            </div>
          </div>

          {/* Gráficas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-green-900/30 p-6 rounded-lg backdrop-blur-sm">
              <h3 className="text-xl font-bold text-green-500 mb-4">Visitas por día</h3>
              <div className="h-64">
                <canvas ref={visitsChartRef}></canvas>
              </div>
            </div>

            <div className="bg-green-900/30 p-6 rounded-lg backdrop-blur-sm">
              <h3 className="text-xl font-bold text-green-500 mb-4">Suscriptores nuevos</h3>
              <div className="h-64">
                <canvas ref={subscribersChartRef}></canvas>
              </div>
            </div>
          </div>

          {/* Tabla de artículos más populares */}
          {metricsData.popularArticles.length > 0 ? (
            <div className="bg-green-900/30 p-6 rounded-lg backdrop-blur-sm">
              <h3 className="text-xl font-bold text-green-500 mb-4">Artículos más populares</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-green-700">
                  <thead className="bg-green-800/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-green-300 uppercase tracking-wider">Título</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-green-300 uppercase tracking-wider">Fecha</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-green-300 uppercase tracking-wider">Visitas</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-green-300 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-green-900/20 divide-y divide-green-800">
                    {metricsData.popularArticles.map((article) => (
                      <tr key={article.id} className="hover:bg-green-800/30">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-white">{article.title}</div>
                          <div className="text-xs text-green-400 mt-1">{article.slug || ''}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-green-200">{formatDate(article.publishDate)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-green-400">{article.visits}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <a href={`/blog/${article.slug}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300" title="Ver">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-green-900/30 p-6 rounded-lg backdrop-blur-sm text-center">
              <p className="text-xl text-green-300">No hay suficientes datos para mostrar artículos populares</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SiteMetricsPage;
