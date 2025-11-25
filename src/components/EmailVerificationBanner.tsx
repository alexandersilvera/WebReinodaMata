import { useState, useEffect } from 'react';
import { useAuth } from '@/core/hooks/useAuth';

/**
 * Banner que se muestra cuando el usuario no ha verificado su email
 */
export default function EmailVerificationBanner() {
  const { user, sendVerification } = useAuth();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Resetear el estado de dismissed cuando cambie el usuario
  useEffect(() => {
    setIsDismissed(false);
    setMessage(null);
  }, [user?.uid]);

  // No mostrar el banner si:
  // - No hay usuario autenticado
  // - El email ya está verificado
  // - El usuario ha cerrado el banner
  if (!user || user.emailVerified || isDismissed) {
    return null;
  }

  const handleResendEmail = async () => {
    setIsSending(true);
    setMessage(null);

    const result = await sendVerification();

    if (result.success) {
      setMessage({ text: 'Email de verificación enviado. Revisa tu bandeja de entrada.', type: 'success' });
    } else {
      setMessage({ text: result.error || 'Error al enviar el email.', type: 'error' });
    }

    setIsSending(false);

    // Limpiar mensaje después de 5 segundos
    setTimeout(() => setMessage(null), 5000);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  return (
    <div className="bg-yellow-900/20 border-b border-yellow-600/50 px-4 py-3">
      <div className="container mx-auto flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-1">
          <svg
            className="w-5 h-5 text-yellow-500 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div className="flex-1">
            <p className="text-sm text-yellow-200">
              <strong>Tu email no está verificado.</strong> Por favor, revisa tu bandeja de entrada y haz clic en el enlace de verificación.
            </p>
            {message && (
              <p className={`text-xs mt-1 ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                {message.text}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResendEmail}
            disabled={isSending}
            className="text-sm text-yellow-300 hover:text-yellow-100 underline disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isSending ? 'Enviando...' : 'Reenviar email'}
          </button>
          <button
            onClick={handleDismiss}
            className="text-yellow-500 hover:text-yellow-300 transition"
            aria-label="Cerrar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
