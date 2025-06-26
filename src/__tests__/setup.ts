/**
 * Test setup file for Vitest
 * Configures global test environment
 */

import { vi } from 'vitest';

// Mock Firebase config for tests
vi.mock('@/core/firebase/config', () => ({
  auth: {},
  db: {},
  onAuthStateChanged: vi.fn(),
}));

// Mock Firebase functions
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  getDocs: vi.fn(),
  getDoc: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  serverTimestamp: vi.fn(() => new Date()),
  Timestamp: {
    fromDate: vi.fn((date) => ({ toDate: () => date })),
  },
}));

// Mock Firebase auth
vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
}));

// Mock environment variables
process.env.PUBLIC_FIREBASE_API_KEY = 'test-api-key';
process.env.PUBLIC_FIREBASE_PROJECT_ID = 'test-project';
process.env.PUBLIC_FIREBASE_AUTH_DOMAIN = 'test.firebaseapp.com';
process.env.PUBLIC_ADMIN_EMAILS = 'test@admin.com';