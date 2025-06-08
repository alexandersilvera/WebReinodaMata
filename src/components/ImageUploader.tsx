import React, { useState, useRef, useCallback, useEffect } from 'react';
import { storage } from '@/core/firebase/config'; // Import Firebase storage instance
import { ref as storageRefFirebase, uploadBytesResumable, getDownloadURL } from "firebase/storage";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  onError?: (error: string) => void;
  className?: string;
  placeholder?: string;
  maxSizeInMB?: number;
  acceptedTypes?: string[];
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  onError,
  className = "",
  placeholder = "https://example.com/imagen.jpg",
  maxSizeInMB = 5,
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(value);
  const [urlError, setUrlError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Emitir evento personalizado cuando cambie la imagen
  useEffect(() => {
    const event = new CustomEvent('imageChange', { 
      detail: value,
      bubbles: true 
    });
    document.querySelector('[data-component="ImageUploader"]')?.dispatchEvent(event);
  }, [value]);

  // Validar URL de imagen
  const validateImageUrl = useCallback(async (url: string): Promise<boolean> => {
    if (!url.trim()) {
      setUrlError('');
      return false;
    }

    try {
      new URL(url); // Validar formato de URL
    } catch {
      setUrlError('URL inválida');
      return false;
    }

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        setUrlError('');
        setPreviewUrl(url);
        resolve(true);
      };
      img.onerror = () => {
        setUrlError('No se pudo cargar la imagen desde esta URL');
        setPreviewUrl('');
        resolve(false);
      };
      img.src = url;
    });
  }, []);

  // Manejar cambio de URL
  const handleUrlChange = async (url: string) => {
    onChange(url);
    if (url) {
      await validateImageUrl(url);
    } else {
      setPreviewUrl('');
      setUrlError('');
    }
  };

  // Validar archivo
  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `Tipo de archivo no soportado. Usa: ${acceptedTypes.join(', ')}`;
    }

    if (file.size > maxSizeInMB * 1024 * 1024) {
      return `El archivo es demasiado grande. Máximo ${maxSizeInMB}MB`;
    }

    return null;
  };

  // Subir archivo a Firebase Storage
  const uploadFile = async (file: File): Promise<string> => {
    setIsLoading(true);
    return new Promise((resolve, reject) => {
      const uniqueFileName = `article_images/${Date.now()}-${file.name}`;
      const fileRef = storageRefFirebase(storage, uniqueFileName);
      const uploadTask = uploadBytesResumable(fileRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Opcional: actualizar progreso de subida
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
          // Podrías usar un estado para mostrar el progreso en la UI si lo deseas
        },
        (error) => {
          console.error("Error en subida de Firebase:", error);
          setIsLoading(false);
          if (onError) {
            onError(`Error al subir imagen: ${error.message}`);
          }
          reject(new Error(`Error al subir imagen: ${error.code}`));
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            // onChange(downloadURL); // onChange se llama en handleFiles después de que esta promesa resuelve
            // setPreviewUrl(downloadURL); // setPreviewUrl también se llama en handleFiles
            setIsLoading(false);
            resolve(downloadURL);
          } catch (error: any) {
            console.error("Error obteniendo URL de descarga:", error);
            setIsLoading(false);
            if (onError) {
              onError(`Error obteniendo URL: ${error.message}`);
            }
            reject(new Error(`Error obteniendo URL: ${error.code}`));
          }
        }
      );
    });
  };

  // Manejar archivos seleccionados
  const handleFiles = async (files: FileList) => {
    const file = files[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      if (onError) onError(validationError);
      return;
    }

    setIsLoading(true);
    try {
      const uploadedUrl = await uploadFile(file);
      onChange(uploadedUrl);
      setPreviewUrl(uploadedUrl);
      setUrlError('');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al subir archivo';
      if (onError) onError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Eventos de drag & drop
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  // Manejar selección de archivo
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };

  // Abrir selector de archivos
  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  // Limpiar imagen
  const clearImage = () => {
    onChange('');
    setPreviewUrl('');
    setUrlError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Probar URL actual
  const testCurrentUrl = async () => {
    if (value) {
      await validateImageUrl(value);
    }
  };

  return (
    <div className={`space-y-4 ${className}`} data-component="ImageUploader">
      {/* Input de URL */}
      <div className="space-y-2">
        <label className="block text-white text-sm font-medium">
          URL de imagen <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <input
            type="url"
            value={value}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder={placeholder}
            className={`w-full px-4 py-2 bg-green-700/50 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 text-white transition-colors ${
              urlError ? 'border-red-500' : 'border-green-600'
            }`}
          />
          <button
            type="button"
            onClick={testCurrentUrl}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-green-400 hover:text-green-300 text-xs px-2 py-1 rounded transition-colors"
          >
            Probar
          </button>
        </div>
        {urlError && (
          <p className="text-red-400 text-xs">{urlError}</p>
        )}
      </div>

      {/* Separador */}
      <div className="flex items-center">
        <div className="flex-1 border-t border-green-600"></div>
        <span className="px-3 text-gray-400 text-sm">o</span>
        <div className="flex-1 border-t border-green-600"></div>
      </div>

      {/* Área de drag & drop */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={openFileSelector}
        className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-green-400 bg-green-400/10'
            : 'border-green-600 hover:border-green-500 hover:bg-green-700/20'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />

        {isLoading ? (
          <div className="flex flex-col items-center">
            <svg className="animate-spin h-8 w-8 text-green-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-green-300">Subiendo imagen...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <svg className="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-white mb-2">
              <span className="font-medium">Haz clic para subir</span> o arrastra una imagen aquí
            </p>
            <p className="text-gray-400 text-sm">
              PNG, JPG, WEBP o GIF (máx. {maxSizeInMB}MB)
            </p>
          </div>
        )}
      </div>

      {/* Vista previa */}
      {previewUrl && (
        <div className="relative">
          <label className="block text-white text-sm font-medium mb-2">
            Vista previa
          </label>
          <div className="relative inline-block">
            <img
              src={previewUrl}
              alt="Vista previa"
              className="w-full h-48 object-cover rounded-lg border border-green-600"
              onError={() => {
                setPreviewUrl('');
                setUrlError('Error al cargar la imagen');
              }}
            />
            <button
              type="button"
              onClick={clearImage}
              className="absolute top-2 right-2 bg-red-600 hover:bg-red-500 text-white rounded-full p-1 transition-colors"
              title="Eliminar imagen"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Información adicional */}
      <div className="text-xs text-gray-400">
        <p>💡 <strong>Consejo:</strong> Para mejores resultados, usa imágenes con una relación de aspecto 16:9 (1200x675px recomendado)</p>
      </div>
    </div>
  );
};

export default ImageUploader; 