import React, { useState, useRef, useEffect } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

// Declaraciones de tipos para librerías externas
declare global {
  interface Window {
    marked?: {
      parse: (content: string) => string;
    };
    DOMPurify?: {
      sanitize: (html: string) => string;
    };
  }
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Escribe tu contenido aquí usando Markdown...",
  className = ""
}) => {
  const [content, setContent] = useState(value);
  const [isPreview, setIsPreview] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sincronizar con prop value
  useEffect(() => {
    setContent(value);
  }, [value]);

  // Emitir evento personalizado cuando el contenido cambie
  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    
    // Llamar onChange si existe
    if (onChange) {
      onChange(newContent);
    }

    // Emitir evento personalizado para el editor de Astro
    const event = new CustomEvent('contentChange', { 
      detail: newContent,
      bubbles: true 
    });
    document.querySelector('[data-component="RichTextEditor"]')?.dispatchEvent(event);
  };

  // Función para insertar texto en la posición del cursor
  const insertText = (before: string, after: string = '', placeholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const textToInsert = selectedText || placeholder;
    
    const newText = content.substring(0, start) + before + textToInsert + after + content.substring(end);
    handleContentChange(newText);

    // Restaurar la selección
    setTimeout(() => {
      textarea.focus();
      if (selectedText) {
        textarea.setSelectionRange(start, start + before.length + textToInsert.length + after.length);
      } else {
        textarea.setSelectionRange(start + before.length, start + before.length + textToInsert.length);
      }
    }, 0);
  };

  // Funciones de formato
  const formatBold = () => insertText('**', '**', 'texto en negrita');
  const formatItalic = () => insertText('*', '*', 'texto en cursiva');
  const formatStrikethrough = () => insertText('~~', '~~', 'texto tachado');
  const formatCode = () => insertText('`', '`', 'código');
  const formatCodeBlock = () => insertText('\n```\n', '\n```\n', 'código aquí');
  
  const formatHeading = (level: number) => {
    const prefix = '#'.repeat(level) + ' ';
    insertText(prefix, '', `Encabezado ${level}`);
  };

  const formatLink = () => {
    const url = prompt('Ingresa la URL:');
    if (url) {
      insertText('[', `](${url})`, 'texto del enlace');
    }
  };

  const formatImage = () => {
    const url = prompt('Ingresa la URL de la imagen:');
    if (url) {
      insertText('![', `](${url})`, 'descripción de la imagen');
    }
  };

  const formatList = (ordered: boolean = false) => {
    const prefix = ordered ? '1. ' : '- ';
    insertText('\n' + prefix, '', 'elemento de lista');
  };

  const formatQuote = () => insertText('\n> ', '', 'cita aquí');

  const formatTable = () => {
    const table = `
| Columna 1 | Columna 2 | Columna 3 |
|-----------|-----------|-----------|
| Celda 1   | Celda 2   | Celda 3   |
| Celda 4   | Celda 5   | Celda 6   |
`;
    insertText(table, '');
  };

  // Atajos de teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          formatBold();
          break;
        case 'i':
          e.preventDefault();
          formatItalic();
          break;
        case 'k':
          e.preventDefault();
          formatLink();
          break;
        case 'Enter':
          e.preventDefault();
          formatCodeBlock();
          break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
          e.preventDefault();
          formatHeading(parseInt(e.key));
          break;
      }
    }
  };

  // Renderizar vista previa
  const renderPreview = () => {
    if (typeof window !== 'undefined' && window.marked && window.DOMPurify) {
      const html = window.DOMPurify.sanitize(window.marked.parse(content));
      return html;
    }
    return '<div class="text-gray-400">Vista previa no disponible</div>';
  };

  // Componente de barra de herramientas
  const Toolbar = () => (
    <div className="bg-green-800/50 border border-green-600 rounded-md p-2 mb-2">
      <div className="flex flex-wrap items-center gap-1">
        {/* Encabezados */}
        <div className="flex items-center border-r border-green-600 pr-2 mr-2">
          {[1, 2, 3, 4, 5, 6].map(level => (
            <button
              key={level}
              type="button"
              onClick={() => formatHeading(level)}
              className="px-2 py-1 text-xs text-gray-300 hover:text-white hover:bg-green-700 rounded transition-colors"
              title={`Encabezado ${level} (Ctrl+${level})`}
            >
              H{level}
            </button>
          ))}
        </div>

        {/* Formato de texto */}
        <div className="flex items-center border-r border-green-600 pr-2 mr-2">
          <button
            type="button"
            onClick={formatBold}
            className="p-1 text-gray-300 hover:text-white hover:bg-green-700 rounded transition-colors"
            title="Negrita (Ctrl+B)"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h6a4.5 4.5 0 013.256 7.606A5 5 0 0115 20H4a1 1 0 01-1-1V4zm2 1v12h10a3 3 0 000-6H9a1 1 0 110-2h6a2.5 2.5 0 000-5H5z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            type="button"
            onClick={formatItalic}
            className="p-1 text-gray-300 hover:text-white hover:bg-green-700 rounded transition-colors"
            title="Cursiva (Ctrl+I)"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 1a1 1 0 011 1v1h2a1 1 0 110 2h-1l-2 12h1a1 1 0 110 2H7a1 1 0 01-1-1v-1H4a1 1 0 110-2h1l2-12H6a1 1 0 110-2h2V2a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            type="button"
            onClick={formatCode}
            className="p-1 text-gray-300 hover:text-white hover:bg-green-700 rounded transition-colors"
            title="Código inline"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            type="button"
            onClick={formatStrikethrough}
            className="p-1 text-gray-300 hover:text-white hover:bg-green-700 rounded transition-colors"
            title="Texto tachado"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 6a1 1 0 011-1h5a3 3 0 013 3v1a1 1 0 11-2 0V8a1 1 0 00-1-1H4a1 1 0 01-1-1zm0 8a1 1 0 011-1h5a1 1 0 001-1v-1a1 1 0 112 0v1a3 3 0 01-3 3H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Enlaces e imágenes */}
        <div className="flex items-center border-r border-green-600 pr-2 mr-2">
          <button
            type="button"
            onClick={formatLink}
            className="p-1 text-gray-300 hover:text-white hover:bg-green-700 rounded transition-colors"
            title="Enlace (Ctrl+K)"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            type="button"
            onClick={formatImage}
            className="p-1 text-gray-300 hover:text-white hover:bg-green-700 rounded transition-colors"
            title="Imagen"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Listas */}
        <div className="flex items-center border-r border-green-600 pr-2 mr-2">
          <button
            type="button"
            onClick={() => formatList(false)}
            className="p-1 text-gray-300 hover:text-white hover:bg-green-700 rounded transition-colors"
            title="Lista con viñetas"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => formatList(true)}
            className="p-1 text-gray-300 hover:text-white hover:bg-green-700 rounded transition-colors"
            title="Lista numerada"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            type="button"
            onClick={formatQuote}
            className="p-1 text-gray-300 hover:text-white hover:bg-green-700 rounded transition-colors"
            title="Cita"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Otros */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={formatCodeBlock}
            className="p-1 text-gray-300 hover:text-white hover:bg-green-700 rounded transition-colors"
            title="Bloque de código (Ctrl+Enter)"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            type="button"
            onClick={formatTable}
            className="p-1 text-gray-300 hover:text-white hover:bg-green-700 rounded transition-colors"
            title="Tabla"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`space-y-4 ${className}`} data-component="RichTextEditor">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-300">
          Contenido del artículo
        </label>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setIsPreview(!isPreview)}
            className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
          >
            {isPreview ? 'Editar' : 'Vista previa'}
          </button>
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="px-3 py-1 text-sm bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
          >
            {isFullscreen ? 'Salir' : 'Pantalla completa'}
          </button>
        </div>
      </div>

      <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-green-900 p-6' : ''}`}>
        {isFullscreen && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Editor de texto</h2>
            <button
              onClick={() => setIsFullscreen(false)}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded transition-colors"
            >
              Cerrar
            </button>
          </div>
        )}

        <div className={`grid ${isPreview ? 'grid-cols-2' : 'grid-cols-1'} gap-4 ${isFullscreen ? 'h-full' : ''}`}>
          {/* Editor */}
          <div className="space-y-2">
            <Toolbar />
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className={`w-full bg-green-700/50 border border-green-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 resize-none ${
                isFullscreen ? 'h-full' : 'h-96'
              }`}
            />
          </div>

          {/* Vista previa */}
          {isPreview && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-300">Vista previa</h3>
              <div 
                className={`bg-green-800/30 border border-green-600 rounded-md p-4 overflow-auto prose prose-invert prose-green max-w-none ${
                  isFullscreen ? 'h-full' : 'h-96'
                }`}
                dangerouslySetInnerHTML={{ __html: renderPreview() }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RichTextEditor; 