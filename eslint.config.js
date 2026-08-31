import js from '@eslint/js';
import sonarjs from 'eslint-plugin-sonarjs';
import globals from 'globals';

export default [
  {
    ignores: ['node_modules/**', 'vendor/**', 'public/**', 'dist/**', 'resources/lang/**'],
  },
  js.configs.recommended,
  {
    files: [
      'scripts/**/*.mjs',
      'tests/**/*.mjs',
      'resources/assets/scripts/**/*.js',
      'vite.config.js',
    ],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        wp: 'readonly',
      },
    },
    plugins: {
      sonarjs,
    },
    rules: {
      complexity: ['error', { max: 12, variant: 'modified' }],
      'no-console': 'off',
      'sonarjs/cognitive-complexity': ['error', 15],
    },
  },
];
