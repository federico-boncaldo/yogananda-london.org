import js from '@eslint/js';
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
    rules: {
      'no-console': 'off',
    },
  },
];
