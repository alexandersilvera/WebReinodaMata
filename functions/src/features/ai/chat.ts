import { onCall } from 'firebase-functions/v2/https';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { defineString } from 'firebase-functions/params';

// Definir la API Key de Gemini como un parámetro secreto
const GEMINI_API_KEY = defineString('GEMINI_API_KEY');

export const getInterestsFromChat = onCall(async (request) => {
  // Verificar que el usuario está autenticado
  if (!request.auth) {
    throw new Error('Authentication required.');
  }

  const message = request.data.message;

  if (!message || typeof message !== 'string') {
    throw new Error('Invalid message provided.');
  }

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY.value());
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
      Eres Kai, un guía espiritual amigable y servicial del centro holístico 'Reino da Mata'.
      Tu tarea es identificar los intereses de un nuevo miembro basándote en su mensaje.
      El usuario acaba de registrarse y le has preguntado qué temas le interesan.

      Analiza el siguiente mensaje y extrae hasta 5 temas o intereses clave.
      Los intereses deben ser relevantes para un centro espiritual/holístico.
      Ejemplos de temas válidos: Astrologia, Tarot, Plantas Medicinales, Chamanismo, Umbanda, Meditacion, Yoga, Cristales, Reiki, Desarrollo Personal, Vidas Pasadas.

      Responde únicamente con un objeto JSON que contenga una única clave "interests" cuyo valor sea un array de strings con los temas extraídos en minúsculas y sin acentos.
      Si no puedes extraer ningún interés relevante, devuelve un array vacío.

      Mensaje del usuario:
      "${message}"
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Limpiar el texto para asegurarnos de que es un JSON válido
    const jsonString = text.replace(/`*`json\n/g, '').replace(/`/g, '');
    const data = JSON.parse(jsonString);
    
    // Validar que la respuesta tiene el formato esperado
    if (!data.interests || !Array.isArray(data.interests)) {
        throw new Error('Invalid response format from AI model.');
    }

    return { interests: data.interests };

  } catch (error) {
    console.error('Error al contactar con la API de Gemini:', error);
    throw new Error('Failed to process message with AI.');
  }
});
