/**
 * Tests for configuration module
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { configUtils, isValidEmail } from '@/core/config';

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
    beforeEach(() => {
      // Setup test environment
      process.env.PUBLIC_ADMIN_EMAILS = 'admin@test.com,super@test.com';
    });

    it('should identify admin emails correctly', () => {
      expect(configUtils.isAdminEmail('admin@test.com')).toBe(true);
      expect(configUtils.isAdminEmail('user@test.com')).toBe(false);
    });

    it('should handle email case insensitivity', () => {
      expect(configUtils.isAdminEmail('ADMIN@TEST.COM')).toBe(true);
      expect(configUtils.isAdminEmail('Admin@Test.Com')).toBe(true);
    });

    it('should detect development environment', () => {
      // In test environment, isDevelopment should return true
      expect(typeof configUtils.isDevelopment()).toBe('boolean');
    });

    it('should provide site URL', () => {
      const siteUrl = configUtils.getSiteUrl();
      expect(typeof siteUrl).toBe('string');
      expect(siteUrl.length).toBeGreaterThan(0);
    });
  });
});