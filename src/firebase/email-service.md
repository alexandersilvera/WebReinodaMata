# Servicio de Correo Electrónico para Suscriptores

Este documento proporciona orientación sobre cómo implementar un servicio de correo electrónico para enviar actualizaciones a los suscriptores utilizando Firebase Cloud Functions.

## Requisitos previos

1. Tener Firebase Cloud Functions habilitado en el proyecto
2. Configurar un servicio de correo electrónico (como SendGrid, Mailgun, Nodemailer con SMTP, etc.)

## Implementación con Firebase Cloud Functions

### 1. Configuración inicial

```bash
# Instalar Firebase CLI si no está instalado
npm install -g firebase-tools

# Inicializar Cloud Functions en el proyecto
firebase init functions

# Navegar al directorio de functions
cd functions

# Instalar dependencias necesarias (ejemplo con SendGrid)
npm install @sendgrid/mail
```

### 2. Implementación de la función para enviar correos

Crear el siguiente archivo en el directorio de functions:

```typescript
// functions/src/email.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as sgMail from '@sendgrid/mail';

// Inicializar Firebase Admin
admin.initializeApp();

// Configurar SendGrid
sgMail.setApiKey(functions.config().sendgrid.key);

// Función para enviar correo a todos los suscriptores activos
export const sendNewsletterToSubscribers = functions.https.onCall(async (data, context) => {
  // Verificar si el usuario es administrador
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'El usuario debe estar autenticado para usar esta función'
    );
  }

  // En un sistema real, verificaríamos si el usuario tiene rol de administrador
  // por ejemplo, usando custom claims
  // if (!context.auth.token.admin) {
  //   throw new functions.https.HttpsError(
  //     'permission-denied',
  //     'El usuario no tiene permisos de administrador'
  //   );
  // }

  try {
    // Obtener todos los suscriptores activos
    const snapshot = await admin
      .firestore()
      .collection('subscribers')
      .where('active', '==', true)
      .get();

    if (snapshot.empty) {
      return { success: true, sent: 0, message: 'No hay suscriptores activos' };
    }

    const { subject, content, htmlContent, fromName } = data;

    // Validar datos
    if (!subject || !content) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'El asunto y contenido son obligatorios'
      );
    }

    // Preparar correos
    const emails = [];
    const subscribers = [];

    snapshot.forEach((doc) => {
      const subscriber = doc.data();
      subscribers.push(subscriber);

      emails.push({
        to: subscriber.email,
        from: {
          email: 'noreply@reinodamata.com',
          name: fromName || 'Centro Umbandista Reino Da Mata'
        },
        subject,
        text: content,
        html: htmlContent || content.replace(/\n/g, '<br>'),
        // Puedes incluir datos personalizados para cada suscriptor
        personalizations: [
          {
            to: [{ email: subscriber.email }],
            dynamic_template_data: {
              first_name: subscriber.firstName,
              unsubscribe_link: `https://reinodamata.com/unsubscribe?id=${doc.id}&email=${encodeURIComponent(subscriber.email)}`
            }
          }
        ]
      });
    });

    // Enviar correos (en lotes si es necesario para evitar límites de API)
    const batchSize = 100;
    let sentCount = 0;

    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      await sgMail.send(batch);
      sentCount += batch.length;
    }

    return {
      success: true,
      sent: sentCount,
      message: `Se enviaron ${sentCount} correos exitosamente`
    };
  } catch (error) {
    console.error('Error al enviar correos:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Error al enviar los correos electrónicos',
      error
    );
  }
});

// Función para enviar correo de confirmación al suscribirse
export const sendSubscriptionConfirmation = functions.firestore
  .document('subscribers/{subscriberId}')
  .onCreate(async (snapshot, context) => {
    const subscriber = snapshot.data();
    
    try {
      const msg = {
        to: subscriber.email,
        from: {
          email: 'noreply@reinodamata.com',
          name: 'Centro Umbandista Reino Da Mata'
        },
        subject: '¡Gracias por suscribirte a nuestro blog!',
        text: `Hola ${subscriber.firstName},\n\nGracias por suscribirte al blog del Centro Umbandista Reino Da Mata. A partir de ahora recibirás actualizaciones sobre nuevos artículos y actividades.\n\nSi en algún momento deseas cancelar tu suscripción, puedes hacerlo a través del enlace que aparecerá en nuestros correos.\n\nSaludos cordiales,\nEquipo de Reino Da Mata`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
            <div style="background-color: #1e3a2b; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: #fff; margin: 0;">¡Gracias por suscribirte!</h1>
            </div>
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px;">
              <p>Hola <strong>${subscriber.firstName}</strong>,</p>
              <p>Gracias por suscribirte al blog del Centro Umbandista Reino Da Mata. A partir de ahora recibirás actualizaciones sobre nuevos artículos y actividades.</p>
              <p>Si en algún momento deseas cancelar tu suscripción, puedes hacerlo a través del enlace que aparecerá en nuestros correos.</p>
              <p>Saludos cordiales,<br>Equipo de Reino Da Mata</p>
            </div>
            <div style="text-align: center; padding: 10px; font-size: 12px; color: #666;">
              <p>© ${new Date().getFullYear()} Centro Umbandista Reino Da Mata. Todos los derechos reservados.</p>
            </div>
          </div>
        `
      };

      await sgMail.send(msg);
      return { success: true };
    } catch (error) {
      console.error('Error al enviar correo de confirmación:', error);
      return { success: false, error };
    }
  });
```

### 3. Agregar esta función al archivo index.ts

```typescript
// functions/src/index.ts
export * from './email';
```

### 4. Configurar variables de entorno

```bash
# Configurar API key de SendGrid (reemplaza YOUR_API_KEY con tu clave real)
firebase functions:config:set sendgrid.key="YOUR_API_KEY"
```

### 5. Desplegar las funciones

```bash
firebase deploy --only functions
```

## Implementación en el frontend

### 1. Crear componente para enviar newsletter

Crea un componente para administradores que permita enviar newsletters:

```typescript
// src/components/NewsletterSender.tsx
import { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/config';

export default function NewsletterSender() {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [fromName, setFromName] = useState('Centro Umbandista Reino Da Mata');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const sendNewsletter = httpsCallable(functions, 'sendNewsletterToSubscribers');
      const response = await sendNewsletter({
        subject,
        content,
        htmlContent,
        fromName
      });
      
      setResult(response.data);
      // Resetear formulario en caso de éxito
      if (response.data.success) {
        setSubject('');
        setContent('');
        setHtmlContent('');
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
      <h2 className="text-2xl font-bold text-green-500 mb-4">Enviar Newsletter</h2>
      
      {result && (
        <div className={`p-4 mb-6 rounded-md ${result.success ? 'bg-green-600/80' : 'bg-red-600/80'} text-white`}>
          <p className="font-medium">{result.success ? '¡Envío exitoso!' : 'Error'}</p>
          <p>{result.message}</p>
          {result.success && <p className="text-sm mt-1">Correos enviados: {result.sent}</p>}
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
          <label htmlFor="content" className="block text-white text-sm font-medium mb-2">
            Contenido (texto plano)
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="w-full px-4 py-2 bg-green-700/50 border border-green-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 text-white"
            required
          />
        </div>
        
        <div>
          <label htmlFor="htmlContent" className="block text-white text-sm font-medium mb-2">
            Contenido HTML (opcional)
          </label>
          <textarea
            id="htmlContent"
            value={htmlContent}
            onChange={(e) => setHtmlContent(e.target.value)}
            rows={10}
            className="w-full px-4 py-2 bg-green-700/50 border border-green-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 text-white font-mono text-sm"
          />
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
              <span>Enviando...</span>
            </>
          ) : (
            <span>Enviar Newsletter</span>
          )}
        </button>
      </form>
    </div>
  );
}
```

### 2. Actualizar la configuración de Firebase para incluir Cloud Functions

```typescript
// src/firebase/config.ts
// ... existing code ...
import { getFunctions } from "firebase/functions";

// ... otras inicializaciones ...

// Initialize Functions
const functions = getFunctions(app);

// Export the initialized services
export { app, db, auth, storage, functions };
```

## Implementación de Desuscripción

Es importante proporcionar a los usuarios una forma de darse de baja:

1. Crear una página de desuscripción que procese los parámetros URL `id` y `email`
2. Verificar que el email coincida con el ID en la base de datos
3. Actualizar el campo `active` a `false` o eliminar el registro

## Consideraciones adicionales

1. **Límites de Firebase**: Revisar los límites gratuitos de Cloud Functions y Firestore
2. **Diseño de emails**: Usar plantillas HTML bien diseñadas para una mejor experiencia
3. **Programación de envíos**: Considerar implementar un sistema para programar envíos automáticos
4. **Análisis**: Implementar seguimiento de apertura y clics para analizar la efectividad
5. **Segmentación**: Permitir enviar newsletters a segmentos específicos de suscriptores 