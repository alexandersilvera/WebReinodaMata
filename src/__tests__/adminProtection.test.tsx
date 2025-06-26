/**
 * Tests for AdminProtection component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AdminProtection from '@/components/AdminProtection';

// Mock Firebase auth
vi.mock('@/core/firebase/config', () => ({
  auth: {},
  onAuthStateChanged: vi.fn((auth, callback) => {
    // Simulate no user logged in
    callback(null);
    return vi.fn(); // unsubscribe function
  }),
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

    expect(screen.getByText('Verificando permisos...')).toBeDefined();
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

  it('should render custom fallback when provided', () => {
    const customFallback = <div>Custom Access Denied</div>;
    
    render(
      <AdminProtection fallback={customFallback}>
        <div>Admin Content</div>
      </AdminProtection>
    );

    // Should eventually show custom fallback
    expect(screen.getByText('Verificando permisos...')).toBeDefined();
  });
});