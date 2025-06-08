import { defineConfig } from 'vitest/config';
import { getViteConfig } from 'astro/config';

export default defineConfig(
  getViteConfig({
    test: {
      // Configuración del entorno de testing
      environment: 'jsdom',
      
      // Configuración de archivos
      include: ['src/**/*.{test,spec}.{js,ts,tsx}'],
      exclude: ['node_modules', 'dist', '.astro'],
      
      // Configuración de setup
      setupFiles: ['./tests/setup.ts'],
      
      // Configuración de cobertura
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: [
          'node_modules/',
          'tests/',
          '**/*.d.ts',
          '**/*.config.*',
          '**/coverage/**',
          'dist/',
          '.astro/',
        ],
        thresholds: {
          global: {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70,
          },
        },
      },
      
      // Variables de entorno para testing
      env: {
        NODE_ENV: 'test',
        PUBLIC_FIREBASE_API_KEY: 'test-api-key',
        PUBLIC_FIREBASE_AUTH_DOMAIN: 'test.firebaseapp.com',
        PUBLIC_FIREBASE_PROJECT_ID: 'test-project',
        PUBLIC_FIREBASE_STORAGE_BUCKET: 'test.firebasestorage.app',
        PUBLIC_FIREBASE_MESSAGING_SENDER_ID: '123456789',
        PUBLIC_FIREBASE_APP_ID: '1:123456789:web:test',
        PUBLIC_SITE_URL: 'http://localhost:4321',
      },
      
      // Configuración de mocks globales
      globals: true,
    },
  })
); 