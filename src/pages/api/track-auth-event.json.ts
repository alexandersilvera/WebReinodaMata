/**
 * API Endpoint: Track Authentication Events
 * Receives auth events from client and stores them in Firestore
 */

import type { APIRoute } from 'astro';
import { initializeApp, cert, getApps, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

// Initialize Firebase Admin if not already initialized
if (getApps().length === 0) {
  try {
    const serviceAccount: ServiceAccount = {
      projectId: import.meta.env.FIREBASE_PROJECT_ID,
      clientEmail: import.meta.env.FIREBASE_CLIENT_EMAIL,
      privateKey: import.meta.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    initializeApp({
      credential: cert(serviceAccount),
    });
  } catch (error) {
    console.error('[Track Auth Event] Error initializing Firebase Admin:', error);
  }
}

interface AuthEventPayload {
  event: 'login' | 'register' | 'logout' | 'password_reset' | 'email_verification';
  timestamp: number;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    // Parse request body
    const body = await request.json() as AuthEventPayload;

    // Validate required fields
    if (!body.event || typeof body.success !== 'boolean' || !body.timestamp) {
      return new Response(
        JSON.stringify({
          error: 'Missing required fields: event, success, timestamp',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate event type
    const validEvents = ['login', 'register', 'logout', 'password_reset', 'email_verification'];
    if (!validEvents.includes(body.event)) {
      return new Response(
        JSON.stringify({
          error: `Invalid event type. Must be one of: ${validEvents.join(', ')}`,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Get client information
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const clientIp = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown';

    // Store event in Firestore using Admin SDK
    const db = getFirestore();
    const authEventsRef = db.collection('auth_events');

    const eventData = {
      event: body.event,
      success: body.success,
      timestamp: Timestamp.fromMillis(body.timestamp),
      error: body.error || null,
      metadata: body.metadata || {},
      // Additional server-side metadata
      serverMetadata: {
        userAgent,
        clientIp,
        serverTimestamp: Timestamp.now(),
      },
    };

    const docRef = await authEventsRef.add(eventData);

    console.log(`[Track Auth Event] Stored ${body.event} event with ID: ${docRef.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        eventId: docRef.id,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('[Track Auth Event] Error:', error);

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error.message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
