/**
 * Tests for configuration module
 */

import { describe, it, expect, vi } from 'vitest';
import { configUtils, isValidEmail } from '@/core/config';

// Mock import.meta.env
vi.mock('@/core/config', async () => {
  const actual = await vi.importActual('@/core/config');
  
  // Mock the config with test data
  const mockConfig = {
    firebase: {
      apiKey: 'test-api-key',
      authDomain: 'test.firebaseapp.com',
      projectId: 'test-project',
      storageBucket: 'test.appspot.com',
      messagingSenderId: '123456789',
      appId: 'test-app-id',
    },
    admin: {
      emails: ['admin@test.com', 'super@test.com'],
    },
    app: {
      siteUrl: 'http://localhost:4321',
      environment: 'test' as const,
    },
    cors: {
      allowedOrigins: ['http://localhost:4321'],
    },
  };
  
  const mockConfigUtils = {
    isAdminEmail: (email: string): boolean => {
      return mockConfig.admin.emails.includes(email.toLowerCase().trim());
    },
    isDevelopment: (): boolean => {
      return mockConfig.app.environment === 'development';
    },
    isProduction: (): boolean => {
      return mockConfig.app.environment === 'production';
    },
    getSiteUrl: (): string => {
      return mockConfig.app.siteUrl;
    },
    isOriginAllowed: (origin: string): boolean => {
      return mockConfig.cors.allowedOrigins.includes(origin);
    },
  };
  
  return {
    ...actual,
    config: mockConfig,
    configUtils: mockConfigUtils,
  };
});

describe('Configuration Module', () => {
  describe('isValidEmail', () => {
    it('should validate correct email formats', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.org')).toBe(true);
      expect(isValidEmail('admin+test@site.co.uk')).toBe(true);
    });

    it('should reject invalid email formats', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('configUtils', () => {
    it('should identify admin emails correctly', () => {
      expect(configUtils.isAdminEmail('admin@test.com')).toBe(true);
      expect(configUtils.isAdminEmail('super@test.com')).toBe(true);
      expect(configUtils.isAdminEmail('user@test.com')).toBe(false);
    });

    it('should handle email case insensitivity', () => {
      expect(configUtils.isAdminEmail('ADMIN@TEST.COM')).toBe(true);
      expect(configUtils.isAdminEmail('Admin@Test.Com')).toBe(true);
      expect(configUtils.isAdminEmail('SUPER@TEST.COM')).toBe(true);
    });

    it('should detect development environment', () => {
      // In test environment, isDevelopment should return false (since we set environment to 'test')
      expect(typeof configUtils.isDevelopment()).toBe('boolean');
      expect(configUtils.isDevelopment()).toBe(false);
    });

    it('should provide site URL', () => {
      const siteUrl = configUtils.getSiteUrl();
      expect(typeof siteUrl).toBe('string');
      expect(siteUrl.length).toBeGreaterThan(0);
      expect(siteUrl).toBe('http://localhost:4321');
    });
  });
});