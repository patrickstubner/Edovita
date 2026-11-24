import js from '@eslint/js';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'dist-pages/**',
      'node_modules/**',
      'prototype/**',
      'design/**',
      'docs/**',
      'playwright-report/**',
      'test-results/**',
      'coverage/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}', 'tests/**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...reactHooksPlugin.configs.recommended.rules,
      // Sicherheitsregeln (ADR-001, ADR-003, SECURITY.md)
      'react/no-danger': 'error',
      'react/no-danger-with-children': 'error',
      'react/react-in-jsx-scope': 'off',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  // ADR-001 Regel 4: components importieren nur domain, i18n und andere components
  {
    files: ['src/components/**/*.{ts,tsx}'],
    ignores: ['src/components/**/*.test.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '../pages*',
                '../hooks*',
                '../app*',
                '../storage*',
                '../catalog*',
                '../nutrition*',
                '../shopping*',
                '../health*',
                '../pwa*',
                '**/content/*',
              ],
              message:
                'ADR-001 Regel 4: src/components darf nur src/domain, src/i18n und andere Komponenten importieren.',
            },
          ],
        },
      ],
    },
  },
  // ADR-001 Regel 5: pages importieren nicht direkt aus storage oder content
  {
    files: ['src/pages/**/*.{ts,tsx}'],
    ignores: ['src/pages/**/*.test.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../storage*', '**/storage/*', '**/content/*'],
              message:
                'ADR-001 Regel 5: src/pages darf nicht direkt aus src/storage oder content/ importieren.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['scripts/**/*.mjs', '*.config.{ts,mjs}', '.dependency-cruiser.mjs'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: ['public/**/*.js'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'script',
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
    },
  },
);
