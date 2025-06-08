import { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../core/firebase/config';

export default function SyncController() {
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [migrateStatus, setMigrateStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<{sync: boolean, migrate: boolean}>({
    sync: false,
    migrate: false
  });
  const [results, setResults] = useState<any>(null);

  // Funciones Cloud
  const syncContentToFiles = httpsCallable(functions, 'syncContentToFiles');
  const migrateMarkdownToFirestore = httpsCallable(functions, 'migrateMarkdownToFirestore');

  // Manejar sincronización
  const handleSync = async () => {
    setSyncStatus('Iniciando sincronización...');
    setIsLoading(prev => ({ ...prev, sync: true }));
    
    try {
      await syncContentToFiles();
      setSyncStatus('Sincronización completada con éxito');
    } catch (error: any) {
      setSyncStatus(`Error: ${error.message || 'No se pudo completar la sincronización'}`);
    } finally {
      setIsLoading(prev => ({ ...prev, sync: false }));
    }
  };

  // Manejar migración
  const handleMigrate = async () => {
    setMigrateStatus('Iniciando migración de archivos a Firestore...');
    setIsLoading(prev => ({ ...prev, migrate: true }));
    setResults(null);
    
    try {
      const result = await migrateMarkdownToFirestore();
      setMigrateStatus('Migración completada');
      setResults(result.data);
    } catch (error: any) {
      setMigrateStatus(`Error: ${error.message || 'No se pudo completar la migración'}`);
    } finally {
      setIsLoading(prev => ({ ...prev, migrate: false }));
    }
  };

  return (
    <div className="bg-green-900/30 p-6 rounded-lg backdrop-blur-sm">
      <h2 className="text-xl font-bold text-green-500 mb-4">Control de Sincronización</h2>
      
      <div className="space-y-6">
        <div className="border-b border-green-800 pb-4">
          <h3 className="text-lg text-white mb-2">Markdown ← Firestore</h3>
          <p className="text-sm text-gray-300 mb-3">
            Sincroniza los artículos de Firestore a archivos Markdown para generar páginas estáticas.
          </p>
          
          <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-3">
            <button
              onClick={handleSync}
              disabled={isLoading.sync}
              className={`px-4 py-2 rounded-md ${
                isLoading.sync
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-500'
              } text-white flex items-center`}
            >
              {isLoading.sync && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              <span>Sincronizar a Markdown</span>
            </button>
            
            {syncStatus && (
              <div className={`text-sm ${syncStatus.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>
                {syncStatus}
              </div>
            )}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg text-white mb-2">Markdown → Firestore</h3>
          <p className="text-sm text-gray-300 mb-3">
            Migra los artículos existentes en formato Markdown a la base de datos Firestore.
            <span className="block text-yellow-400 mt-1">
              Nota: Esta operación solo debe realizarse una vez durante la configuración inicial.
            </span>
          </p>
          
          <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-3">
            <button
              onClick={handleMigrate}
              disabled={isLoading.migrate}
              className={`px-4 py-2 rounded-md ${
                isLoading.migrate
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-yellow-600 hover:bg-yellow-500'
              } text-white flex items-center`}
            >
              {isLoading.migrate && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              <span>Migrar a Firestore</span>
            </button>
            
            {migrateStatus && (
              <div className={`text-sm ${migrateStatus.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>
                {migrateStatus}
              </div>
            )}
          </div>
          
          {results && (
            <div className="mt-4 bg-green-800/30 p-4 rounded-md">
              <h4 className="text-white font-medium mb-2">Resultados de la migración:</h4>
              <p className="text-green-300">{results.message}</p>
              
              {results.migratedArticles && results.migratedArticles.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm text-white mb-2">Artículos migrados:</p>
                  <ul className="text-sm text-gray-300 space-y-1 max-h-48 overflow-y-auto">
                    {results.migratedArticles.map((article: any) => (
                      <li key={article.id} className="flex justify-between">
                        <span>{article.title}</span>
                        <span className="text-green-400">{article.slug}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 