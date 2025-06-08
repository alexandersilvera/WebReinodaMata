import eslintPluginAstro from 'eslint-plugin-astro';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  // Configuraciones globales
  {
    ignores: ["dist/", "node_modules/", ".vercel/", ".astro/"]
  },

  // Configuración base de ESLint (para JS)
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      // Reglas específicas para JS si es necesario
    },
  },

  // Configuración recomendada de TypeScript
  ...tseslint.configs.recommended,

  // Configuración recomendada de Astro
  ...eslintPluginAstro.configs['flat/recommended'],

  // Ajustes específicos para TS y Astro (incluyendo anulación de no-unused-vars)
  {
    files: ['**/*.{ts,astro}'],
    languageOptions: {
      globals: {
          // ... (si se necesitan globales específicos para TS/Astro que no estén ya)
          ...globals.browser // Para archivos .astro
      }
    },
    rules: {
      // Ignorar variables/args no usados que empiecen por _
      '@typescript-eslint/no-unused-vars': [
        'error',
        { 'argsIgnorePattern': '^_', 'varsIgnorePattern': '^_', 'caughtErrorsIgnorePattern': '^_' }
      ],
      // Puedes añadir/sobrescribir otras reglas específicas para TS/Astro aquí
    }
  },

  // Configuración para deshabilitar reglas conflictivas con Prettier (debe ser la última)
  eslintConfigPrettier
);
