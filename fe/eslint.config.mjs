// @ts-check
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default [
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.tsx', '**/*.ts'],
    ...react.configs.flat.recommended,
    ...react.configs.flat['jsx-runtime'],
    ...reactHooks.configs.flat.recommended,
    rules: {
      'react/prop-types': 'off',
      // Relax strict rules so existing codebase passes; re-enable and fix over time
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
    },
    settings: { react: { version: 'detect' } },
  },
  {
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
  },
];
