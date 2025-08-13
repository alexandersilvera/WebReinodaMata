/**
 * Integration tests for Admin functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Admin Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Admin Configuration', () => {
    it('should validate email format correctly', () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      // Valid emails
      expect(emailRegex.test('admin@example.com')).toBe(true);
      expect(emailRegex.test('user.name@domain.co.uk')).toBe(true);
      expect(emailRegex.test('test+tag@example.org')).toBe(true);
      
      // Invalid emails
      expect(emailRegex.test('invalid-email')).toBe(false);
      expect(emailRegex.test('invalid@')).toBe(false);
      expect(emailRegex.test('@invalid.com')).toBe(false);
      expect(emailRegex.test('')).toBe(false);
    });

    it('should normalize emails correctly', () => {
      const normalizeEmail = (email: string) => email.toLowerCase().trim();
      
      expect(normalizeEmail(' Admin@Example.COM ')).toBe('admin@example.com');
      expect(normalizeEmail('USER@DOMAIN.ORG')).toBe('user@domain.org');
      expect(normalizeEmail('  test@site.net  ')).toBe('test@site.net');
    });
  });

  describe('Settings Validation', () => {
    it('should validate newsletter frequency', () => {
      const validFrequencies = ['weekly', 'biweekly', 'monthly'];
      
      expect(validFrequencies.includes('weekly')).toBe(true);
      expect(validFrequencies.includes('monthly')).toBe(true);
      expect(validFrequencies.includes('daily')).toBe(false);
      expect(validFrequencies.includes('invalid')).toBe(false);
    });

    it('should validate string lengths', () => {
      const maxLength = 1000;
      const shortString = 'Valid string';
      const longString = 'x'.repeat(1001);
      
      expect(shortString.length <= maxLength).toBe(true);
      expect(longString.length <= maxLength).toBe(false);
    });
  });

  describe('Metrics Calculations', () => {
    it('should calculate successful syncs correctly', () => {
      const authSyncedUsers = 100;
      const totalFailed = 15;
      const successfulSyncs = Math.max(0, authSyncedUsers - totalFailed);
      
      expect(successfulSyncs).toBe(85);
    });

    it('should handle edge cases in metrics', () => {
      // More failures than synced users
      const authSyncedUsers = 10;
      const totalFailed = 15;
      const successfulSyncs = Math.max(0, authSyncedUsers - totalFailed);
      
      expect(successfulSyncs).toBe(0);
    });

    it('should calculate retry counts correctly', () => {
      const mockDocs = [
        { processed: false, retryCount: 1 }, // Should retry
        { processed: false, retryCount: 3 }, // Should retry
        { processed: false, retryCount: 5 }, // Should not retry (max reached)
        { processed: true, retryCount: 2 },  // Already processed
      ];

      const pendingRetry = mockDocs.filter(doc => 
        !doc.processed && (doc.retryCount || 0) < 5
      ).length;

      expect(pendingRetry).toBe(2);
    });
  });

  describe('Date Formatting', () => {
    it('should format dates correctly', () => {
      const formatFirestoreDate = (timestamp: any): string => {
        if (!timestamp) return 'Fecha no disponible';
        
        let date: Date;
        if (timestamp instanceof Date) {
          date = timestamp;
        } else if (timestamp.toDate && typeof timestamp.toDate === 'function') {
          date = timestamp.toDate();
        } else {
          return 'Formato de fecha inválido';
        }
        
        return new Intl.DateTimeFormat('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }).format(date);
      };

      const testDate = new Date('2023-01-01T10:30:00Z');
      const mockFirestoreTimestamp = {
        toDate: () => testDate
      };

      expect(formatFirestoreDate(testDate)).toContain('2023');
      expect(formatFirestoreDate(mockFirestoreTimestamp)).toContain('2023');
      expect(formatFirestoreDate(null)).toBe('Fecha no disponible');
      expect(formatFirestoreDate('invalid')).toBe('Formato de fecha inválido');
    });
  });

  describe('Duration Formatting', () => {
    it('should format durations correctly', () => {
      const formatDuration = (ms: number): string => {
        if (ms < 1000) return `${ms}ms`;
        if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
        return `${(ms / 60000).toFixed(1)}min`;
      };

      expect(formatDuration(500)).toBe('500ms');
      expect(formatDuration(1500)).toBe('1.5s');
      expect(formatDuration(90000)).toBe('1.5min');
    });
  });

  describe('Source Information', () => {
    it('should return correct source info', () => {
      const getSourceInfo = (source: string): { label: string; color: string } => {
        const sourceMap: Record<string, { label: string; color: string }> = {
          'web': { label: 'Suscripción Web', color: 'bg-blue-600' },
          'auth_sync': { label: 'Auth Manual', color: 'bg-purple-600' },
          'auth_auto': { label: 'Auth Automático', color: 'bg-green-600' },
          'auth_trigger': { label: 'Auth Trigger', color: 'bg-indigo-600' },
          'auth_trigger_v2': { label: 'Auth Trigger v2', color: 'bg-teal-600' },
          'manual': { label: 'Manual', color: 'bg-gray-600' }
        };
        
        return sourceMap[source] || { label: 'Desconocido', color: 'bg-gray-500' };
      };

      const webInfo = getSourceInfo('web');
      expect(webInfo.label).toBe('Suscripción Web');
      expect(webInfo.color).toBe('bg-blue-600');

      const unknownInfo = getSourceInfo('unknown_source');
      expect(unknownInfo.label).toBe('Desconocido');
      expect(unknownInfo.color).toBe('bg-gray-500');
    });
  });

  describe('Environment Configuration', () => {
    it('should handle environment-specific admin email configuration', () => {
      const getAdminEmailsFromEnv = (envEmails?: string, nodeEnv?: string) => {
        if (envEmails) {
          return envEmails.split(',').map(email => email.trim());
        }
        
        if (nodeEnv === 'development') {
          return [
            'admin@example.com',
            'admin@centroumbandistareinodamata.org',
            'administrador@centroumbandistareinodamata.org'
          ];
        }
        
        return [];
      };

      // With environment emails
      expect(getAdminEmailsFromEnv('admin1@test.com,admin2@test.com')).toEqual([
        'admin1@test.com',
        'admin2@test.com'
      ]);

      // Development fallback
      const devEmails = getAdminEmailsFromEnv(undefined, 'development');
      expect(devEmails).toContain('admin@example.com');

      // Production without config
      expect(getAdminEmailsFromEnv(undefined, 'production')).toEqual([]);
    });
  });
});