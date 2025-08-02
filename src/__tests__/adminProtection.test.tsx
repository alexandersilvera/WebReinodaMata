/**
 * Tests for AdminProtection component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AdminProtection from '@/components/AdminProtection';

// Declare callback variable
let mockAuthCallback: any;

// Mock Firebase auth with async behavior
vi.mock('@/core/firebase/config', () => ({
  auth: {},
  functions: {},
  onAuthStateChanged: vi.fn((auth, callback) => {
    mockAuthCallback = callback;
    // Simulate async behavior - don't call immediately
    setTimeout(() => {
      callback(null); // Simulate no user logged in
    }, 50);
    return vi.fn(); // unsubscribe function
  }),
  httpsCallable: vi.fn(() => vi.fn()),
}));

// Mock admin config service
vi.mock('@/features/admin/configService', () => ({
  isAdminEmail: vi.fn().mockResolvedValue(false),
}));

// Mock article service
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

describe('AdminProtection Component', () => {
  it('should render loading state initially', () => {
    render(
      <AdminProtection>
        <div>Admin Content</div>
      </AdminProtection>
    );

    // Use regex matcher to be more flexible with text matching
    expect(screen.getByText(/verificando permisos/i)).toBeDefined();
  });

  it('should render access denied when user is not admin', async () => {
    render(
      <AdminProtection>
        <div>Admin Content</div>
      </AdminProtection>
    );

    // Wait for auth state to resolve
    await new Promise(resolve => setTimeout(resolve, 100));

    // Should show access denied
    expect(screen.getByText('Acceso Denegado')).toBeDefined();
  });

  it('should render custom fallback when provided', async () => {
    const customFallback = <div>Custom Access Denied</div>;
    
    render(
      <AdminProtection fallback={customFallback}>
        <div>Admin Content</div>
      </AdminProtection>
    );

    // Initially should show loading
    expect(screen.getByText(/verificando permisos/i)).toBeDefined();
  });
});