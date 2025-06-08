import React, { useState, useRef, useEffect, useMemo } from 'react';

interface TagsInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  className?: string;
  suggestions?: string[];
  allowCustomTags?: boolean;
  separators?: string[];
}

const TagsInput: React.FC<TagsInputProps> = ({
  value = [],
  onChange,
  placeholder = "Escribe una etiqueta y presiona Enter...",
  maxTags = 10,
  className = "",
  suggestions = [],
  allowCustomTags = true,
  separators = [',', ';', 'Enter']
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [error, setError] = useState('');
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Etiquetas predefinidas para contenido espiritual
  const defaultSuggestions = useMemo(() => [
    'umbanda',
    'espiritualidad',
    'orixás',
    'guías espirituales',
    'rituales',
    'meditación',
    'energía',
    'chakras',
    'sanación',
    'tarot',
    'astrología',
    'numerología',
    'cristales',
    'incienso',
    'velas',
    'protección',
    'limpieza energética',
    'ancestros',
    'tradiciones',
    'fe',
    'devoción',
    'oraciones',
    'mantras',
    'paz interior',
    'equilibrio',
    'armonía',
    'conexión espiritual',
    'despertar',
    'consciencia',
    'transformación'
  ], []);

  const allSuggestions = useMemo(() => 
    [...new Set([...defaultSuggestions, ...suggestions])], 
    [defaultSuggestions, suggestions]
  );

  // Calcular sugerencias filtradas con useMemo
  const filteredSuggestions = useMemo(() => {
    let filtered: string[];
    
    if (!inputValue.trim()) {
      filtered = allSuggestions.slice(0, 8); // Mostrar las primeras 8 sugerencias populares
    } else {
      filtered = allSuggestions.filter(suggestion => 
        suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
        !value.includes(suggestion)
      ).slice(0, 8);
    }

    return filtered;
  }, [inputValue, value.length, allSuggestions, value.join(',')]);

  // Actualizar estado de sugerencias cuando cambien las sugerencias filtradas
  useEffect(() => {
    setShowSuggestions(filteredSuggestions.length > 0);
    setActiveSuggestionIndex(-1);
  }, [filteredSuggestions]);

  // Validar etiqueta
  const validateTag = (tag: string): string | null => {
    const trimmedTag = tag.trim().toLowerCase();
    
    if (!trimmedTag) {
      return 'La etiqueta no puede estar vacía';
    }

    if (trimmedTag.length < 2) {
      return 'La etiqueta debe tener al menos 2 caracteres';
    }

    if (trimmedTag.length > 30) {
      return 'La etiqueta no puede exceder 30 caracteres';
    }

    if (value.includes(trimmedTag)) {
      return 'Esta etiqueta ya existe';
    }

    if (value.length >= maxTags) {
      return `Máximo ${maxTags} etiquetas permitidas`;
    }

    if (!allowCustomTags && !allSuggestions.includes(trimmedTag)) {
      return 'Solo se permiten etiquetas predefinidas';
    }

    return null;
  };

  // Agregar etiqueta
  const addTag = (tag: string) => {
    const validationError = validateTag(tag);
    if (validationError) {
      setError(validationError);
      return false;
    }

    const trimmedTag = tag.trim().toLowerCase();
    onChange([...value, trimmedTag]);
    setInputValue('');
    setError('');
    setShowSuggestions(false);
    return true;
  };

  // Remover etiqueta
  const removeTag = (indexToRemove: number) => {
    onChange(value.filter((_, index) => index !== indexToRemove));
    setError('');
  };

  // Manejar cambio en el input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Verificar si el usuario escribió un separador
    const lastChar = newValue.slice(-1);
    if (separators.includes(lastChar) && newValue.length > 1) {
      const tagToAdd = newValue.slice(0, -1);
      if (addTag(tagToAdd)) {
        return;
      }
    }

    setInputValue(newValue);
    setError('');
  };

  // Manejar teclas especiales
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        if (activeSuggestionIndex >= 0 && filteredSuggestions[activeSuggestionIndex]) {
          addTag(filteredSuggestions[activeSuggestionIndex]);
        } else if (inputValue.trim()) {
          addTag(inputValue);
        }
        break;

      case 'ArrowDown':
        e.preventDefault();
        if (showSuggestions) {
          setActiveSuggestionIndex(prev => 
            prev < filteredSuggestions.length - 1 ? prev + 1 : 0
          );
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (showSuggestions) {
          setActiveSuggestionIndex(prev => 
            prev > 0 ? prev - 1 : filteredSuggestions.length - 1
          );
        }
        break;

      case 'Escape':
        setShowSuggestions(false);
        setActiveSuggestionIndex(-1);
        break;

      case 'Backspace':
        if (!inputValue && value.length > 0) {
          removeTag(value.length - 1);
        }
        break;

      case 'Tab':
        if (showSuggestions && activeSuggestionIndex >= 0) {
          e.preventDefault();
          addTag(filteredSuggestions[activeSuggestionIndex]);
        }
        break;
    }
  };

  // Manejar clic en sugerencia
  const handleSuggestionClick = (suggestion: string) => {
    addTag(suggestion);
    inputRef.current?.focus();
  };

  // Manejar focus/blur
  const handleFocus = () => {
    setShowSuggestions(filteredSuggestions.length > 0);
  };

  const handleBlur = () => {
    // Delay para permitir clics en sugerencias
    setTimeout(() => {
      setShowSuggestions(false);
      setActiveSuggestionIndex(-1);
    }, 200);
  };

  // Scroll automático en sugerencias
  useEffect(() => {
    if (activeSuggestionIndex >= 0 && suggestionsRef.current) {
      const suggestionElement = suggestionsRef.current.children[activeSuggestionIndex] as HTMLElement;
      if (suggestionElement) {
        suggestionElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [activeSuggestionIndex]);

  return (
    <div className={`relative ${className}`} data-component="TagsInput">
      {/* Contenedor principal */}
      <div className={`min-h-[42px] px-3 py-2 bg-green-700/50 border rounded-md focus-within:ring-2 focus-within:ring-green-400 transition-colors ${
        error ? 'border-red-500' : 'border-green-600'
      }`}>
        {/* Etiquetas existentes */}
        <div className="flex flex-wrap gap-2 mb-2">
          {value.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 bg-green-600 text-white text-sm rounded-full"
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => removeTag(index)}
                className="ml-1 text-green-200 hover:text-white focus:outline-none"
                aria-label={`Eliminar etiqueta ${tag}`}
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </span>
          ))}
        </div>

        {/* Input */}
        {value.length < maxTags && (
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={value.length === 0 ? placeholder : ''}
            className="w-full bg-transparent text-white placeholder-gray-400 focus:outline-none"
          />
        )}
      </div>

      {/* Mensaje de error */}
      {error && (
        <p className="mt-1 text-red-400 text-xs">{error}</p>
      )}

      {/* Contador de etiquetas */}
      <div className="mt-1 text-xs text-gray-400 flex justify-between">
        <span>{value.length}/{maxTags} etiquetas</span>
        {separators.includes(',') && (
          <span>Usa comas o Enter para separar</span>
        )}
      </div>

      {/* Sugerencias */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 w-full mt-1 bg-green-800 border border-green-600 rounded-md shadow-lg max-h-48 overflow-y-auto"
        >
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className={`w-full px-3 py-2 text-left text-white hover:bg-green-700 transition-colors ${
                index === activeSuggestionIndex ? 'bg-green-700' : ''
              }`}
            >
              <span className="text-sm">{suggestion}</span>
              {defaultSuggestions.includes(suggestion) && (
                <span className="ml-2 text-xs text-green-300">Popular</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Sugerencias populares (cuando no hay input) */}
      {!inputValue && value.length === 0 && (
        <div className="mt-2">
          <p className="text-xs text-gray-400 mb-2">Etiquetas populares:</p>
          <div className="flex flex-wrap gap-1">
            {defaultSuggestions.slice(0, 6).map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => addTag(tag)}
                className="px-2 py-1 text-xs bg-green-700/50 text-green-300 rounded hover:bg-green-600 hover:text-white transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Ayuda */}
      <div className="mt-2 text-xs text-gray-400">
        <p>💡 <strong>Consejos:</strong></p>
        <ul className="list-disc list-inside ml-2 space-y-1">
          <li>Usa etiquetas descriptivas y relevantes</li>
          <li>Presiona Tab o Enter para seleccionar sugerencias</li>
          <li>Usa Backspace para eliminar la última etiqueta</li>
          <li>Las etiquetas se convierten automáticamente a minúsculas</li>
        </ul>
      </div>
    </div>
  );
};

export default TagsInput; 