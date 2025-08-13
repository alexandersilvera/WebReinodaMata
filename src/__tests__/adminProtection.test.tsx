/**
 * Tests for AdminProtection component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import AdminProtection from '@/components/AdminProtection';

// Mock Firebase auth with async behavior
// Use importOriginal to preserve other exports like getFirestore
const mockOnAuthStateChanged = vi.fn();
const mockHttpsCallable = vi.fn(() => vi.fn());

vi.mock('@/core/firebase/config', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@/core/firebase/config')>();
  return {
    ...mod,
    auth: {},
    functions: {},
    onAuthStateChanged: mockOnAuthStateChanged,
    httpsCallable: mockHttpsCallable,
  };
});

// Mock Firebase Firestore
vi.mock('firebase/firestore', async (importOriginal) => {
  const mod = await importOriginal<typeof import('firebase/firestore')>();
  return {
    ...mod,
    getFirestore: vi.fn(),
    doc: vi.fn(),
    getDoc: vi.fn(),
    setDoc: vi.fn(),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    collection: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
    startAfter: vi.fn(),
    getDocs: vi.fn(),
    onSnapshot: vi.fn(),
    serverTimestamp: vi.fn(),
    Timestamp: { fromDate: vi.fn(), now: vi.fn() },
  };
});

// Mock Firebase Auth
vi.mock('firebase/auth', async (importOriginal) => {
  const mod = await importOriginal<typeof import('firebase/auth')>();
  return {
    ...mod,
    getAuth: vi.fn(),
    signInWithEmailAndPassword: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChanged: mockOnAuthStateChanged,
    User: vi.fn(),
  };
});

// Mock Firebase Functions
vi.mock('firebase/functions', async (importOriginal) => {
  const mod = await importOriginal<typeof import('firebase/functions')>();
  return {
    ...mod,
    getFunctions: vi.fn(),
    httpsCallable: mockHttpsCallable,
  };
});

// Mock admin config service
const mockIsAdminEmail = vi.fn();
vi.mock('@/features/admin/configService', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@/features/admin/configService')>();
  return {
    ...mod,
    isAdminEmail: mockIsAdminEmail,
  };
});

// Mock article service (keep as is, it's not directly related to AdminProtection logic)
vi.mock('@/services/articleService', () => ({
  getAllArticles: vi.fn(),
  getAllDrafts: vi.fn(),
  deleteArticle: vi.fn(),
  deleteDraft: vi.fn(),
  publishDraftAsArticle: vi.fn(),
  getArticleById: vi.fn(),
  updateArticle: vi.fn(),
  checkSlugExists: vi.fn(),
}));

// Mock newsletter service
vi.mock('@/features/newsletter/subscriberService', () => ({
  getAllSubscribers: vi.fn(),
  deleteSubscriber: vi.fn(),
  updateSubscriberStatus: vi.fn(),
  subscribeToSubscribers: vi.fn(),
}));

describe('AdminProtection Component', () => {
  beforeEach(() => {
    // Reset mocks before each test to ensure isolation
    vi.clearAllMocks();
    // Set default mock implementations
    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      // Default: no user logged in
      setTimeout(() => {
        callback(null);
      }, 50);
      return vi.fn(); // unsubscribe function
    });
    mockIsAdminEmail.mockResolvedValue(false); // Default: not admin
  });

  it('should render loading state initially', () => {
    render(
      <AdminProtection>
        <div>Admin Content</div>
      </AdminProtection>
    );

    expect(screen.getByText(/verificando permisos/i)).toBeDefined();
  });

  it('should render access denied when user is not admin', async () => {
    render(
      <AdminProtection>
        <div>Admin Content</div>
      </AdminProtection>
    );

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(screen.getByText('Acceso Denegado')).toBeDefined();
  });

  it('should render custom fallback when provided and user is not admin', async () => {
    const customFallback = <div>Custom Access Denied Fallback</div>;
    
    render(
      <AdminProtection fallback={customFallback}>
        <div>Admin Content</div>
      </AdminProtection>
    );

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(screen.getByText('Custom Access Denied Fallback')).toBeDefined();
  });

  it('should render admin content when user is admin', async () => {
    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      setTimeout(() => {
        callback({ email: 'admin@example.com' }); // Simulate admin user
      }, 50);
      return vi.fn();
    });
    mockIsAdminEmail.mockResolvedValue(true); // Simulate admin email check passes

    render(
      <AdminProtection>
        <div>Admin Content</div>
      </AdminProtection>
    );

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(screen.getByText('Admin Content')).toBeDefined();
  });

  it('should render access denied when isAdminEmail throws an error', async () => {
    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      setTimeout(() => {
        callback({ email: 'user@example.com' }); // Simulate a user
      }, 50);
      return vi.fn();
    });
    mockIsAdminEmail.mockRejectedValue(new Error('Network error')); // Simulate error during admin check

    render(
      <AdminProtection>
        <div>Admin Content</div>
      </AdminProtection>
    );

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(screen.getByText('Acceso Denegado')).toBeDefined();
  });
});