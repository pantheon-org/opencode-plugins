import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import preferArrowPlugin from 'eslint-plugin-prefer-arrow';
import sonarjsPlugin from 'eslint-plugin-sonarjs';
import tsdocPlugin from 'eslint-plugin-tsdoc';
import jsdocPlugin from 'eslint-plugin-jsdoc';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'writable',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'prefer-arrow': preferArrowPlugin,
      sonarjs: sonarjsPlugin,
      import: importPlugin,
      tsdoc: tsdocPlugin,
      jsdoc: jsdocPlugin,
      prettier: prettierPlugin,
    },
    settings: {
      'import/resolver': {
        typescript: {},
      },
      jsdoc: {
        mode: 'typescript',
      },
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,

      // Prettier integration
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          tabWidth: 2,
          semi: true,
          trailingComma: 'all',
        },
      ],

      // Code quality rules
      'max-lines': ['warn', { max: 200, skipBlankLines: true, skipComments: true }],
      'max-statements': ['error', 30],
      complexity: ['warn', 10],

      // TypeScript rules
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],

      // Modern JavaScript
      'no-var': 'error',
      'prefer-const': 'error',
      'no-undef': 'off', // TypeScript handles this

      // Arrow functions
      'prefer-arrow/prefer-arrow-functions': [
        'error',
        {
          disallowPrototype: true,
          singleReturnOnly: false,
          classPropertiesAllowed: false,
        },
      ],

      // Import rules
      'import/max-dependencies': ['warn', { max: 10 }],
      'import/no-cycle': 'error',
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],

      // TSDoc
      'tsdoc/syntax': 'error',

      // JSDoc rules (TypeScript-friendly)
      'jsdoc/require-jsdoc': [
        'error',
        {
          require: {
            FunctionDeclaration: true,
            ClassDeclaration: true,
            MethodDefinition: false,
            ArrowFunctionExpression: false,
            FunctionExpression: false,
            ClassExpression: false,
          },
          publicOnly: true,
        },
      ],
      'jsdoc/require-param': 'off',
      'jsdoc/check-tag-names': 'warn',
      'jsdoc/no-undefined-types': 'off',
      'jsdoc/require-param-type': 'off',
      'jsdoc/require-returns-type': 'off',
    },
  },
  {
    files: ['**/*.test.ts', '**/*.spec.ts'],
    rules: {
      'tsdoc/syntax': 'off',
      'prettier/prettier': 'off',
      'max-lines': 'off',
      'jsdoc/require-jsdoc': 'off',
    },
  },
  {
    files: ['**/*.js', '**/*.jsx'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'writable',
      },
    },
  },
  {
    ignores: ['node_modules/', 'dist/', 'build/', '.nx/', 'coverage/', 'bun.lock'],
  },
  prettierConfig,
];
