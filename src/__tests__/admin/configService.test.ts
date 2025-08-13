/**
 * Tests for Admin Config Service
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getAdminConfig,
  updateAdminConfig,
  getAdminEmails,
  isAdminEmail,
  initializeAdminConfig,
  subscribeToAdminConfig
} from '@/features/admin/configService';

// Mock Firebase Firestore
const mockGetDoc = vi.fn();
const mockSetDoc = vi.fn();
const mockOnSnapshot = vi.fn();
const mockServerTimestamp = vi.fn(() => ({ __type: 'timestamp' }));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: mockGetDoc,
  setDoc: mockSetDoc,
  onSnapshot: mockOnSnapshot,
  serverTimestamp: mockServerTimestamp,
}));

// Mock Firebase config
vi.mock('@/core/firebase/config', () => ({
  db: {},
}));

// Mock config module
vi.mock('@/core/config', () => ({
  config: {
    admin: {
      emails: ['admin@example.com', 'test@example.com']
    }
  }
}));

// Mock logger
vi.mock('@/features/admin/services/logger', () => ({
  configLogger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }
}));

describe('Admin Config Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAdminConfig', () => {
    it('should return admin config when document exists', async () => {
      const mockData = {
        emails: ['admin@test.com'],
        lastUpdated: new Date(),
        updatedBy: 'test-user'
      };

      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => mockData
      });

      const result = await getAdminConfig();
      expect(result).toEqual(mockData);
    });

    it('should return null when document does not exist', async () => {
      mockGetDoc.mockResolvedValueOnce({
        exists: () => false
      });

      const result = await getAdminConfig();
      expect(result).toBeNull();
    });

    it('should return null when there is an error', async () => {
      mockGetDoc.mockRejectedValueOnce(new Error('Network error'));

      const result = await getAdminConfig();
      expect(result).toBeNull();
    });
  });

  describe('updateAdminConfig', () => {
    it('should successfully update admin config', async () => {
      mockSetDoc.mockResolvedValueOnce(undefined);

      const emails = ['admin@test.com', 'super@test.com'];
      await updateAdminConfig(emails, 'test-user');

      expect(mockSetDoc).toHaveBeenCalledWith(
        expect.anything(),
        {
          emails: ['admin@test.com', 'super@test.com'],
          lastUpdated: { __type: 'timestamp' },
          updatedBy: 'test-user'
        }
      );
    });

    it('should validate email formats', async () => {
      const invalidEmails = ['invalid-email', 'admin@test.com'];
      
      await expect(
        updateAdminConfig(invalidEmails, 'test-user')
      ).rejects.toThrow('Email inválido: invalid-email');
    });

    it('should normalize email addresses', async () => {
      mockSetDoc.mockResolvedValueOnce(undefined);

      const emails = [' Admin@Test.COM ', '  user@Example.org  '];
      await updateAdminConfig(emails, 'test-user');

      expect(mockSetDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          emails: ['admin@test.com', 'user@example.org']
        })
      );
    });
  });

  describe('getAdminEmails', () => {
    it('should return emails from Firestore when available', async () => {
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          emails: ['firestore@test.com'],
          lastUpdated: new Date(),
          updatedBy: 'test'
        })
      });

      const result = await getAdminEmails();
      expect(result).toEqual(['firestore@test.com']);
    });

    it('should fallback to environment config when Firestore is empty', async () => {
      mockGetDoc.mockResolvedValueOnce({
        exists: () => false
      });

      // Mock window to simulate client-side
      Object.defineProperty(window, 'window', { value: undefined });

      const result = await getAdminEmails();
      expect(result).toContain('admin@centroumbandistareinodamata.org');
    });
  });

  describe('isAdminEmail', () => {
    it('should return true for admin emails', async () => {
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          emails: ['admin@test.com'],
          lastUpdated: new Date(),
          updatedBy: 'test'
        })
      });

      const result = await isAdminEmail('admin@test.com');
      expect(result).toBe(true);
    });

    it('should return false for non-admin emails', async () => {
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          emails: ['admin@test.com'],
          lastUpdated: new Date(),
          updatedBy: 'test'
        })
      });

      const result = await isAdminEmail('user@test.com');
      expect(result).toBe(false);
    });

    it('should return false for empty email', async () => {
      const result = await isAdminEmail('');
      expect(result).toBe(false);
    });

    it('should handle case insensitive comparison', async () => {
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          emails: ['admin@test.com'],
          lastUpdated: new Date(),
          updatedBy: 'test'
        })
      });

      const result = await isAdminEmail('ADMIN@TEST.COM');
      expect(result).toBe(true);
    });
  });

  describe('initializeAdminConfig', () => {
    it('should initialize config when none exists', async () => {
      mockGetDoc.mockResolvedValueOnce({
        exists: () => false
      });
      mockSetDoc.mockResolvedValueOnce(undefined);

      await initializeAdminConfig();

      expect(mockSetDoc).toHaveBeenCalled();
    });

    it('should not initialize when config already exists', async () => {
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ emails: ['admin@test.com'] })
      });

      await initializeAdminConfig();

      expect(mockSetDoc).not.toHaveBeenCalled();
    });
  });

  describe('subscribeToAdminConfig', () => {
    it('should call callback with config data when document exists', () => {
      const mockCallback = vi.fn();
      const mockUnsubscribe = vi.fn();

      const mockData = {
        emails: ['admin@test.com'],
        lastUpdated: new Date(),
        updatedBy: 'test'
      };

      mockOnSnapshot.mockImplementation((docRef, callback, errorCallback) => {
        callback({
          exists: () => true,
          data: () => mockData
        });
        return mockUnsubscribe;
      });

      const unsubscribe = subscribeToAdminConfig(mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(mockData);
      expect(typeof unsubscribe).toBe('function');
    });

    it('should call callback with null when document does not exist', () => {
      const mockCallback = vi.fn();
      const mockUnsubscribe = vi.fn();

      mockOnSnapshot.mockImplementation((docRef, callback, errorCallback) => {
        callback({
          exists: () => false
        });
        return mockUnsubscribe;
      });

      subscribeToAdminConfig(mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(null);
    });

    it('should handle errors by calling callback with null', () => {
      const mockCallback = vi.fn();
      const mockUnsubscribe = vi.fn();

      mockOnSnapshot.mockImplementation((docRef, callback, errorCallback) => {
        errorCallback(new Error('Network error'));
        return mockUnsubscribe;
      });

      subscribeToAdminConfig(mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(null);
    });
  });
});