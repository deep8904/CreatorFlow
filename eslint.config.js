import js from '@eslint/js'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import reactHooks from 'eslint-plugin-react-hooks'
import prettier from 'eslint-config-prettier'

export default [
  js.configs.recommended,
  {
    ignores: ['node_modules/**', '.next/**', 'dist/**', 'playwright-report/**', 'test-results/**', 'supabase/functions/**', '.claude/**'],
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        process: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        Request: 'readonly',
        URL: 'readonly',
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        HTMLCanvasElement: 'readonly',
        HTMLSpanElement: 'readonly',
        HTMLDivElement: 'readonly',
        HTMLButtonElement: 'readonly',
        HTMLAnchorElement: 'readonly',
        HTMLInputElement: 'readonly',
        HTMLTextAreaElement: 'readonly',
        HTMLLabelElement: 'readonly',
        HTMLElement: 'readonly',
        BeforeUnloadEvent: 'readonly',
        KeyboardEvent: 'readonly',
        MouseEvent: 'readonly',
        Node: 'readonly',
        URLSearchParams: 'readonly',
        getComputedStyle: 'readonly',
        PointerEvent: 'readonly',
        IntersectionObserver: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        queueMicrotask: 'readonly',
        performance: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'react-hooks': reactHooks,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['scripts/**/*.{js,ts}'],
    languageOptions: {
      globals: {
        console: 'readonly',
      },
    },
  },
  prettier,
]
