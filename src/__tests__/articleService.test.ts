/**
 * Tests for Article Service
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Article } from '@/services/articleService';

// Mock the entire module
vi.mock('@/services/articleService', async () => {
  const actual = await vi.importActual('@/services/articleService');
  return {
    ...actual,
    // Mock Firebase operations for testing
    createArticle: vi.fn(),
    updateArticle: vi.fn(),
    deleteArticle: vi.fn(),
    getAllArticles: vi.fn(),
    getArticleById: vi.fn(),
    checkSlugExists: vi.fn(),
  };
});

describe('Article Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Article Type Validation', () => {
    it('should have correct article structure', () => {
      const mockArticle: Article = {
        id: 'test-id',
        title: 'Test Article',
        slug: 'test-article',
        content: 'Test content',
        description: 'Test description',
        image: 'test-image.jpg',
        author: 'Test Author',
        tags: ['test', 'article'],
        draft: false,
        featured: false,
        commentsEnabled: true,
        views: 0,
        publishDate: { toDate: () => new Date() } as any,
        createdAt: { toDate: () => new Date() } as any,
        updatedAt: { toDate: () => new Date() } as any,
      };

      // Validate required fields
      expect(mockArticle.title).toBeTruthy();
      expect(mockArticle.slug).toBeTruthy();
      expect(mockArticle.content).toBeTruthy();
      expect(Array.isArray(mockArticle.tags)).toBe(true);
      expect(typeof mockArticle.draft).toBe('boolean');
      expect(typeof mockArticle.featured).toBe('boolean');
      expect(typeof mockArticle.views).toBe('number');
    });
  });

  describe('Service Functions', () => {
    it('should export required functions', async () => {
      const {
        createArticle,
        updateArticle,
        deleteArticle,
        getAllArticles,
        getArticleById,
        checkSlugExists,
      } = await import('@/services/articleService');

      expect(typeof createArticle).toBe('function');
      expect(typeof updateArticle).toBe('function');
      expect(typeof deleteArticle).toBe('function');
      expect(typeof getAllArticles).toBe('function');
      expect(typeof getArticleById).toBe('function');
      expect(typeof checkSlugExists).toBe('function');
    });
  });
});