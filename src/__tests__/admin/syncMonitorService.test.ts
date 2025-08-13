/**
 * Tests for Sync Monitor Service
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  SyncMonitorService,
  formatters
} from '@/features/admin/syncMonitorService';

// Mock Firebase Firestore
const mockGetDocs = vi.fn();
const mockUpdateDoc = vi.fn();
const mockServerTimestamp = vi.fn(() => ({ __type: 'timestamp' }));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  startAfter: vi.fn(),
  getDocs: mockGetDocs,
  doc: vi.fn(),
  updateDoc: mockUpdateDoc,
  serverTimestamp: mockServerTimestamp,
}));

// Mock Firebase config
vi.mock('@/core/firebase/config', () => ({
  db: {},
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  getDocs: mockGetDocs,
  doc: vi.fn(),
  updateDoc: mockUpdateDoc,
  serverTimestamp: mockServerTimestamp,
}));

// Mock logger
vi.mock('@/features/admin/services/logger', () => ({
  syncLogger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  }
}));

describe('SyncMonitorService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getMetrics', () => {
    it('should return correct metrics', async () => {
      const mockSubscribers = {
        size: 100,
        docs: [
          { data: () => ({ authUid: 'user1' }) },
          { data: () => ({ authUid: 'user2' }) },
          { data: () => ({}) }, // No authUid
        ]
      };

      const mockFailedSyncs = {
        size: 5,
        docs: [
          { data: () => ({ processed: false, retryCount: 1 }) },
          { data: () => ({ processed: false, retryCount: 3 }) },
          { data: () => ({ processed: true, retryCount: 2 }) },
        ]
      };

      mockGetDocs
        .mockResolvedValueOnce(mockSubscribers)
        .mockResolvedValueOnce(mockFailedSyncs);

      const metrics = await SyncMonitorService.getMetrics();

      expect(metrics).toEqual({
        totalSubscribers: 100,
        totalFailed: 5,
        pendingRetry: 2, // Only unprocessed with retry count < 5
        successfulSyncs: 0, // Max(0, 2 - 5)
        authSyncedUsers: 2
      });
    });

    it('should handle errors gracefully', async () => {
      mockGetDocs.mockRejectedValueOnce(new Error('Network error'));

      await expect(SyncMonitorService.getMetrics()).rejects.toThrow('Network error');
    });
  });

  describe('getFailedSyncs', () => {
    it('should return failed syncs with correct mapping', async () => {
      const mockDocs = [
        {
          id: 'sync1',
          data: () => ({
            userId: 'user1',
            email: 'user1@test.com',
            error: { message: 'Test error' },
            timestamp: new Date()
          })
        }
      ];

      mockGetDocs.mockResolvedValueOnce({
        docs: mockDocs
      });

      const result = await SyncMonitorService.getFailedSyncs(20);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'sync1',
        userId: 'user1',
        email: 'user1@test.com',
        error: { message: 'Test error' },
        timestamp: expect.any(Date)
      });
    });
  });

  describe('getFailedSyncsPaginated', () => {
    it('should handle pagination correctly', async () => {
      const mockDocs = new Array(21).fill(null).map((_, i) => ({
        id: `sync${i}`,
        data: () => ({ email: `user${i}@test.com` })
      }));

      mockGetDocs.mockResolvedValueOnce({
        docs: mockDocs
      });

      const result = await SyncMonitorService.getFailedSyncsPaginated({ limit: 20 });

      expect(result.items).toHaveLength(20);
      expect(result.hasNextPage).toBe(true);
      expect(result.nextCursor).toBeDefined();
    });

    it('should handle last page correctly', async () => {
      const mockDocs = new Array(15).fill(null).map((_, i) => ({
        id: `sync${i}`,
        data: () => ({ email: `user${i}@test.com` })
      }));

      mockGetDocs.mockResolvedValueOnce({
        docs: mockDocs
      });

      const result = await SyncMonitorService.getFailedSyncsPaginated({ limit: 20 });

      expect(result.items).toHaveLength(15);
      expect(result.hasNextPage).toBe(false);
      expect(result.nextCursor).toBeUndefined();
    });
  });

  describe('markFailedSyncAsProcessed', () => {
    it('should update document with processed flag', async () => {
      mockUpdateDoc.mockResolvedValueOnce(undefined);

      await SyncMonitorService.markFailedSyncAsProcessed('sync123');

      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        {
          processed: true,
          processedAt: { __type: 'timestamp' },
          manuallyProcessed: true
        }
      );
    });

    it('should handle update errors', async () => {
      mockUpdateDoc.mockRejectedValueOnce(new Error('Update failed'));

      await expect(
        SyncMonitorService.markFailedSyncAsProcessed('sync123')
      ).rejects.toThrow('Update failed');
    });
  });

  describe('getPerformanceMetrics', () => {
    it('should return default metrics when no data exists', async () => {
      mockGetDocs.mockResolvedValueOnce({ empty: true });

      const metrics = await SyncMonitorService.getPerformanceMetrics();

      expect(metrics).toEqual({
        averageSyncDuration: 0,
        successRate: 0,
        totalProcessed: 0,
        lastProcessingTime: null
      });
    });

    it('should calculate metrics from sync data', async () => {
      const mockTimestamp = {
        toDate: () => new Date('2023-01-01T10:00:00Z')
      };

      const mockDocs = [
        { data: () => ({ duration: 1000, type: 'auth_trigger_success', timestamp: mockTimestamp }) },
        { data: () => ({ duration: 2000, type: 'auth_trigger_success', timestamp: mockTimestamp }) },
        { data: () => ({ duration: 1500, type: 'auth_trigger_failed', timestamp: mockTimestamp }) },
      ];

      mockGetDocs.mockResolvedValueOnce({
        empty: false,
        size: 3,
        docs: mockDocs
      });

      const metrics = await SyncMonitorService.getPerformanceMetrics();

      expect(metrics.averageSyncDuration).toBe(1500); // (1000+2000+1500)/3
      expect(metrics.successRate).toBe(66.67); // (2/3)*100 rounded
      expect(metrics.totalProcessed).toBe(3);
      expect(metrics.lastProcessingTime).toEqual(new Date('2023-01-01T10:00:00Z'));
    });
  });
});

describe('formatters', () => {
  describe('formatFirestoreDate', () => {
    it('should format Firestore Timestamp', () => {
      const mockTimestamp = {
        toDate: () => new Date('2023-01-01T10:30:00Z')
      };

      const result = formatters.formatFirestoreDate(mockTimestamp as any);

      // Result depends on locale, but should contain date parts
      expect(result).toContain('2023');
      expect(result).toContain('01');
    });

    it('should format Date object', () => {
      const date = new Date('2023-01-01T10:30:00Z');

      const result = formatters.formatFirestoreDate(date);

      expect(result).toContain('2023');
      expect(result).toContain('01');
    });

    it('should handle null/undefined', () => {
      expect(formatters.formatFirestoreDate(null)).toBe('Fecha no disponible');
      expect(formatters.formatFirestoreDate(undefined)).toBe('Fecha no disponible');
    });

    it('should handle invalid format', () => {
      const result = formatters.formatFirestoreDate('invalid' as any);
      expect(result).toBe('Formato de fecha inválido');
    });
  });

  describe('formatDuration', () => {
    it('should format milliseconds', () => {
      expect(formatters.formatDuration(500)).toBe('500ms');
    });

    it('should format seconds', () => {
      expect(formatters.formatDuration(1500)).toBe('1.5s');
    });

    it('should format minutes', () => {
      expect(formatters.formatDuration(90000)).toBe('1.5min');
    });
  });

  describe('getSourceInfo', () => {
    it('should return correct info for known sources', () => {
      const webInfo = formatters.getSourceInfo('web');
      expect(webInfo.label).toBe('Suscripción Web');
      expect(webInfo.color).toBe('bg-blue-600');

      const authInfo = formatters.getSourceInfo('auth_trigger');
      expect(authInfo.label).toBe('Auth Trigger');
      expect(authInfo.color).toBe('bg-indigo-600');
    });

    it('should return default info for unknown sources', () => {
      const unknownInfo = formatters.getSourceInfo('unknown_source');
      expect(unknownInfo.label).toBe('Desconocido');
      expect(unknownInfo.color).toBe('bg-gray-500');
    });
  });
});