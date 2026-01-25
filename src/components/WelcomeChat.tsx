import { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions, getFirestore, doc, updateDoc, arrayUnion } from '@/core/firebase/config';
import { useAuth } from '@/core/hooks/useAuth';

export default function WelcomeChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: '¡Hola! Soy Kai, tu guía espiritual en Reino da Mata. Para personalizar tu experiencia, cuéntame un poco sobre qué temas te interesan. Por ejemplo: ¿te atrae la astrología, el tarot, las plantas medicinales, o el desarrollo personal?'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || loading) return;

    const userMessage = { id: Date.now(), sender: 'user', text: inputValue };
    setMessages(prev => [...prev, userMessage]);
    const currentInputValue = inputValue;
    setInputValue('');
    setLoading(true);
    setError(null);

    try {
      const getInterests = httpsCallable(functions, 'getInterestsFromChat');
      const result = await getInterests({ message: currentInputValue });
      
      const data = result.data as { interests: string[] };
      const interests = data.interests;

      let botResponseText = '';
      if (interests && interests.length > 0) {
        botResponseText = `¡Entendido! He identificado tus intereses en: ${interests.join(', ')}. Tu experiencia será personalizada.`;
        
        // Guardar intereses en Firestore
        if (user) {
          const db = getFirestore();
          const userDocRef = doc(db, 'userProfiles', user.uid);
          await updateDoc(userDocRef, {
            interests: arrayUnion(...interests)
          });
          console.log(`Intereses [${interests.join(', ')}] guardados para el usuario ${user.uid}`);
        }
        setIsCompleted(true); // Marcar como completado para mostrar el botón de continuar

      } else {
        botResponseText = "Gracias por compartir. No he podido identificar intereses específicos, pero no te preocupes, ¡explora la web para descubrir todo lo que ofrecemos!";
        setIsCompleted(true); // También se completa si no se identifican intereses
      }
      
      const botMessage = { id: Date.now() + 1, sender: 'bot', text: botResponseText };
      setMessages(prev => [...prev, botMessage]);

    } catch (err: any) {
      console.error("Error calling getInterestsFromChat function or updating profile:", err);
      const errorMessageText = 'Lo siento, ha ocurrido un error al procesar tu mensaje. Puedes continuar y explorar la web.';
      setError(errorMessageText);
      const errorMessage = { id: Date.now() + 1, sender: 'bot', text: errorMessageText };
      setMessages(prev => [...prev, errorMessage]);
      setIsCompleted(true); // Permitir al usuario continuar incluso si hay un error
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    window.location.href = '/'; // Redirigir a la página de inicio
  };

  return (
    <div className="flex flex-col h-[60vh] bg-[#2a292e] rounded-lg">
      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender === 'bot' ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg ${msg.sender === 'bot' ? 'bg-gray-700 text-white' : 'bg-[#F08F4A] text-white'}`}>
              <p>{msg.text}</p>
            </div>
          </div>
        ))}
        {loading && (
           <div className="flex justify-start">
             <div className="max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg bg-gray-700 text-white">
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse delay-0"></div>
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse delay-200"></div>
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse delay-400"></div>
                </div>
             </div>
           </div>
        )}
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      </div>
      
      {isCompleted ? (
        <div className="p-4 text-center">
          <button
            onClick={handleContinue}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-md transition duration-300 ease-in-out"
          >
            Continuar al sitio
          </button>
        </div>
      ) : (
        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-600">
          <div className="flex items-center">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full px-4 py-2 bg-[#1f1e23] border border-gray-600 rounded-l-md text-white focus:ring-[#F08F4A] focus:border-[#F08F4A] transition"
              placeholder="Escribe tu respuesta aquí..."
              disabled={loading}
            />
            <button
              type="submit"
              className="bg-[#F08F4A] hover:bg-[#D9734E] text-white font-bold py-2 px-4 rounded-r-md transition duration-300 ease-in-out disabled:opacity-50"
              disabled={loading}
            >
              Enviar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
