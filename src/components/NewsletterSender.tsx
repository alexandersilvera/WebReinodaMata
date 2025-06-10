import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { httpsCallable } from 'firebase/functions';
import RichTextEditor from "@/components/RichTextEditor"; // Importar RichTextEditor
import { functions } from '../core/firebase/config';
import { getSubscriberStats, handleFirestoreError, retryOperation } from '../utils/firestoreQueries';
import type { SubscriberStats } from '../utils/firestoreQueries';

export default function NewsletterSender() {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [markdownContent, setMarkdownContent] = useState(''); // Nuevo estado para Markdown
  const [fromName, setFromName] = useState('Centro Umbandista Reino Da Mata');
  const [testEmail, setTestEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [subscriberStats, setSubscriberStats] = useState<SubscriberStats>({ 
    total: 0, 
    active: 0, 
    inactive: 0, 
    deleted: 0 
  });
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);

  // Cargar estadísticas de suscriptores al montar el componente
  useEffect(() => {
    const loadSubscriberStats = async () => {
      setStatsLoading(true);
      try {
        // Usar la nueva función de utilidades con reintentos
        const stats = await retryOperation(() => getSubscriberStats(), 3, 1000);
        setSubscriberStats(stats);
      } catch (error) {
        console.error('Error al cargar estadísticas de suscriptores:', error);
        const errorMessage = handleFirestoreError(error);
        setResult({ 
          success: false, 
          message: `Error al cargar estadísticas: ${errorMessage}` 
        });
      } finally {
        setStatsLoading(false);
      }
    };
    
    loadSubscriberStats();
  }, []);

  // Efecto para sincronizar markdownContent a htmlContent y content
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).marked && (window as any).DOMPurify) {
      const newHtml = (window as any).DOMPurify.sanitize((window as any).marked.parse(markdownContent));
      setHtmlContent(newHtml);
      // Opcional: Sincronizar con el campo de texto plano.
      // Podrías querer una versión más limpia (sin markdown/html) para 'content'.
      // Por ahora, si el usuario usa el editor markdown, el texto plano será el markdown.
      setContent(markdownContent);
    } else if (markdownContent) { // Si hay markdown pero las librerías no están, al menos pasar el markdown al texto plano.
      setContent(markdownContent);
      console.warn("marked o DOMPurify no están disponibles. La vista previa HTML no se actualizará desde Markdown.");
    }
  }, [markdownContent]);

  const handleMarkdownChange = (newMarkdown: string) => {
    setMarkdownContent(newMarkdown);
    // La lógica de conversión a HTML y texto plano ahora está en el useEffect.
  };

  // Función para enviar un correo de prueba
  const sendTestEmail = async () => {
    if (!testEmail || !subject || !markdownContent) {
      setResult({ success: false, message: 'Por favor completa al menos el asunto, contenido y correo de prueba' });
      return;
    }
    
    setIsSendingTest(true);
    try {
      const sendTestNewsletter = httpsCallable<
        { subject: string; content: string; htmlContent?: string; fromName?: string; testEmail: string },
        { success: boolean; message: string }
      >(functions, 'sendTestNewsletter');
      
      const response = await sendTestNewsletter({
        subject,
        content, // plain text version
        htmlContent, // html version
        fromName,
        testEmail
      });
      
      setResult(response.data);
    } catch (error) {
      console.error('Error al enviar correo de prueba:', error);
      setResult({ success: false, message: 'Error al enviar el correo de prueba' });
    } finally {
      setIsSendingTest(false);
    }
  };

  // Función para mostrar/ocultar la vista previa
  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  // Función para enviar el newsletter a todos los suscriptores
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!subject || !markdownContent) {
      setResult({ success: false, message: 'Por favor completa al menos el asunto y contenido' });
      return;
    }
    
    // Confirmación antes de enviar
    if (!window.confirm(`¿Estás seguro de enviar este newsletter a ${subscriberStats.active} suscriptores activos?`)) {
      return;
    }
    
    setLoading(true);
    try {
      const sendNewsletter = httpsCallable<
        { subject: string; content: string; htmlContent?: string; fromName?: string },
        { success: boolean; sent?: number; message: string }
      >(functions, 'sendNewsletterToSubscribers');
      
      const response = await sendNewsletter({
        subject,
        content,
        htmlContent,
        fromName
      });
      
      setResult(response.data);
      if (response.data.success) {
        // No limpiamos los campos para permitir enviar el mismo contenido a otros grupos si es necesario
      }
    } catch (error) {
      console.error('Error al enviar newsletter:', error);
      setResult({ success: false, message: 'Error al enviar el newsletter' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-green-900/30 p-6 rounded-lg backdrop-blur-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-green-500">Enviar Newsletter</h2>
        {statsLoading ? (
          <div className="flex items-center text-sm text-green-300 bg-green-900/50 px-3 py-1 rounded-md">
            <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Cargando estadísticas...
          </div>
        ) : (
          <div className="text-sm text-green-300 bg-green-900/50 px-3 py-1 rounded-md">
            <div className="flex items-center space-x-4">
              <span>
                <span className="font-medium text-green-400">{subscriberStats.active}</span> activos
              </span>
              <span className="text-gray-400">|</span>
              <span>
                <span className="font-medium">{subscriberStats.total}</span> totales
              </span>
              {subscriberStats.inactive > 0 && (
                <>
                  <span className="text-gray-400">|</span>
                  <span>
                    <span className="font-medium text-yellow-400">{subscriberStats.inactive}</span> inactivos
                  </span>
                </>
              )}
              {subscriberStats.deleted > 0 && (
                <>
                  <span className="text-gray-400">|</span>
                  <span>
                    <span className="font-medium text-red-400">{subscriberStats.deleted}</span> eliminados
                  </span>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      
      {result && (
        <div className={`p-4 mb-6 rounded-md ${result.success ? 'bg-green-600/80' : 'bg-red-600/80'} text-white`}>
          <p className="font-medium">{result.success ? '¡Envío exitoso!' : 'Error'}</p>
          <p>{result.message}</p>
          {result.success && result.sent && <p className="text-sm mt-1">Correos enviados: {result.sent}</p>}
        </div>
      )}
      
      <div className="mb-6 flex space-x-2">
        <button 
          type="button" 
          onClick={togglePreview}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-md transition-colors"
        >
          {showPreview ? 'Ocultar vista previa' : 'Mostrar vista previa'}
        </button>
      </div>
      
      {showPreview && (
        <div className="mb-6 border border-green-600 rounded-md overflow-hidden">
          <div className="bg-gray-100 p-4 text-gray-800">
            <div className="mb-2"><strong>De:</strong> {fromName}</div>
            <div className="mb-2"><strong>Asunto:</strong> {subject || '[Sin asunto]'}</div>
            <hr className="my-2 border-gray-300" />
            <div className="mt-4">
              {htmlContent ? (
                <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
              ) : (
                <div style={{ whiteSpace: 'pre-wrap' }}>{content || '[Sin contenido]'}</div>
              )}
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="fromName" className="block text-white text-sm font-medium mb-2">
            Nombre del remitente
          </label>
          <input
            id="fromName"
            type="text"
            value={fromName}
            onChange={(e) => setFromName(e.target.value)}
            className="w-full px-4 py-2 bg-green-700/50 border border-green-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 text-white"
            required
          />
        </div>
        
        <div>
          <label htmlFor="subject" className="block text-white text-sm font-medium mb-2">
            Asunto
          </label>
          <input
            id="subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-4 py-2 bg-green-700/50 border border-green-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 text-white"
            required
          />
        </div>
        
        <div>
          <label htmlFor="rich-text-editor" className="block text-white text-sm font-medium mb-2">
            Contenido del Newsletter (Markdown)
          </label>
          <RichTextEditor
            value={markdownContent}
            onChange={handleMarkdownChange}
            placeholder="Escribe el contenido del newsletter en Markdown aquí..."
            className="min-h-[200px] bg-green-700/50 border border-green-600 rounded-md text-white"
          />
        </div>
        
        {/* Sección para enviar correo de prueba */}
        <div className="bg-blue-900/30 p-4 rounded-md border border-blue-800">
          <h3 className="text-lg font-medium text-blue-400 mb-3">Enviar correo de prueba</h3>
          <div className="flex space-x-2">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              className="flex-grow px-4 py-2 bg-blue-800/50 border border-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-white"
            />
            <button
              type="button"
              onClick={sendTestEmail}
              disabled={isSendingTest || !testEmail}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-md transition-colors disabled:bg-blue-800 disabled:cursor-not-allowed flex items-center"
            >
              {isSendingTest ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Enviando...</span>
                </>
              ) : (
                <span>Enviar prueba</span>
              )}
            </button>
          </div>
          <p className="text-xs text-blue-300 mt-2">Envía una copia del newsletter a tu correo para verificar cómo se verá.</p>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-6 bg-green-600 hover:bg-green-500 text-white font-medium rounded-md shadow-md transition-colors duration-300 flex items-center justify-center disabled:bg-green-800 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Enviando a {subscriberStats.active} suscriptores...</span>
            </>
          ) : (
            <span>Enviar Newsletter a {subscriberStats.active} suscriptores</span>
          )}
        </button>
      </form>
    </div>
  );
} 