/**
 * Tests for Settings Service
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  loadSettings,
  saveSettings
} from '@/features/admin/settingsService';

// Mock Firebase Firestore
const mockGetDoc = vi.fn();
const mockSetDoc = vi.fn();
const mockServerTimestamp = vi.fn(() => ({ __type: 'timestamp' }));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: mockGetDoc,
  setDoc: mockSetDoc,
  serverTimestamp: mockServerTimestamp,
}));

// Mock Firebase config
vi.mock('@/core/firebase/config', () => ({
  db: {},
}));

// Mock logger
vi.mock('@/features/admin/services/logger', () => ({
  settingsLogger: {
    info: vi.fn(),
    error: vi.fn(),
  }
}));

describe('Settings Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loadSettings', () => {
    it('should return settings when document exists', async () => {
      const mockSettings = {
        siteTitle: 'Test Site',
        siteDescription: 'A test website',
        contactEmail: 'contact@test.com',
        enableComments: true,
        enableNewsletter: false
      };

      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => mockSettings
      });

      const result = await loadSettings();
      expect(result).toEqual(mockSettings);
    });

    it('should return null when document does not exist', async () => {
      mockGetDoc.mockResolvedValueOnce({
        exists: () => false
      });

      const result = await loadSettings();
      expect(result).toBeNull();
    });

    it('should throw error when there is a network issue', async () => {
      const error = new Error('Network error');
      mockGetDoc.mockRejectedValueOnce(error);

      await expect(loadSettings()).rejects.toThrow('No se pudo cargar la configuración del sitio.');
    });
  });

  describe('saveSettings', () => {
    it('should save settings successfully', async () => {
      const settingsToSave = {
        siteTitle: 'Updated Site',
        enableComments: false
      };

      mockSetDoc.mockResolvedValueOnce(undefined);

      await saveSettings(settingsToSave);

      expect(mockSetDoc).toHaveBeenCalledWith(
        expect.anything(),
        {
          ...settingsToSave,
          updatedAt: { __type: 'timestamp' }
        },
        { merge: true }
      );
    });

    it('should handle save errors', async () => {
      const settingsToSave = {
        siteTitle: 'Updated Site'
      };

      const error = new Error('Save failed');
      mockSetDoc.mockRejectedValueOnce(error);

      await expect(saveSettings(settingsToSave)).rejects.toThrow('No se pudo guardar la configuración del sitio.');
    });

    it('should merge settings with existing data', async () => {
      const partialSettings = {
        siteTitle: 'New Title'
      };

      mockSetDoc.mockResolvedValueOnce(undefined);

      await saveSettings(partialSettings);

      expect(mockSetDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining(partialSettings),
        { merge: true }
      );
    });

    it('should always add updatedAt timestamp', async () => {
      const settingsToSave = {
        contactEmail: 'new@test.com'
      };

      mockSetDoc.mockResolvedValueOnce(undefined);

      await saveSettings(settingsToSave);

      expect(mockSetDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          updatedAt: { __type: 'timestamp' }
        }),
        { merge: true }
      );
    });
  });

  describe('settings validation', () => {
    it('should handle boolean settings correctly', async () => {
      const booleanSettings = {
        enableSitemap: true,
        enableComments: false,
        moderateComments: true,
        requireLogin: false,
        enableNewsletter: true
      };

      mockSetDoc.mockResolvedValueOnce(undefined);

      await saveSettings(booleanSettings);

      expect(mockSetDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining(booleanSettings),
        { merge: true }
      );
    });

    it('should handle string settings correctly', async () => {
      const stringSettings = {
        siteTitle: 'My Website',
        siteDescription: 'A great website',
        contactEmail: 'admin@website.com',
        metaKeywords: 'website, blog, content',
        googleAnalytics: 'GA-123456789',
        welcomeEmail: 'Welcome to our site!'
      };

      mockSetDoc.mockResolvedValueOnce(undefined);

      await saveSettings(stringSettings);

      expect(mockSetDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining(stringSettings),
        { merge: true }
      );
    });

    it('should handle newsletter frequency setting', async () => {
      const frequencySettings = {
        newsletterFrequency: 'monthly' as const
      };

      mockSetDoc.mockResolvedValueOnce(undefined);

      await saveSettings(frequencySettings);

      expect(mockSetDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining(frequencySettings),
        { merge: true }
      );
    });
  });
});