import importPlugin from 'eslint-plugin-import';
import prettierPlugin from 'eslint-plugin-prettier';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tseslint from 'typescript-eslint';
import nx from '@nx/eslint-plugin';

export default [
  /* ------------------------------------------------------------------ */
  /* Nx base configs                                                     */
  /* ------------------------------------------------------------------ */
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],

  /* ------------------------------------------------------------------ */
  /* Ignore build artifacts                                              */
  /* ------------------------------------------------------------------ */
  {
    ignores: ['**/dist', '**/out-tsc', '**/.next', '**/coverage', '**/.nx', '**/tmp'],
  },

  /* ------------------------------------------------------------------ */
  /* Shared rules (TS / JS for all projects)                             */
  /* ------------------------------------------------------------------ */
  {
    files: ['**/*.{ts,tsx,js,jsx,cjs,mjs,cts,mts}'],
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      import: importPlugin,
      prettier: prettierPlugin,
      'simple-import-sort': simpleImportSort,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: [
            './tsconfig.base.json',
            './apps/*/tsconfig.json',
            './apps/*/tsconfig.app.json',
            './libs/*/tsconfig.json',
          ],
          noWarnOnMultipleProjects: true,
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
    rules: {
      /* ---------------- Prettier ---------------- */
      'prettier/prettier': 'warn',

      /* ---------------- Imports ----------------- */
      'import/no-named-as-default-member': 'off',

      /* ---------------- Unused ------------------ */
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],

      /* ---------------- Style ------------------- */
      'max-len': ['warn', { code: 120, ignoreUrls: true }],

      /* ---------------- Types ------------------- */
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'separate-type-imports',
          disallowTypeAnnotations: false,
        },
      ],

      /* ---------------- Sorting ----------------- */
      'simple-import-sort/exports': 'error',
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^react', '^\\w', '^@[^/]'],
            ['^@org\\/'],
            ['@/styles/base\\.scss$'],
            ['^@types'],
            ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
            ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
            ['[A-Za-z@\\.].+\\.s?css$'],
          ],
        },
      ],

      /* ---------------- Nx boundaries ----------- */
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
    },
  },

  /* ------------------------------------------------------------------ */
  /* Client (Next.js / React)                                            */
  /* ------------------------------------------------------------------ */
  {
    files: ['apps/client/**/*.{ts,tsx,js,jsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      ...reactHooks.configs.recommended.rules,
    },
  },

  /* ------------------------------------------------------------------ */
  /* Node services                                                       */
  /* ------------------------------------------------------------------ */
  {
    files: ['apps/**/src/**/*.ts'],
    languageOptions: {
      globals: {
        process: 'readonly',
        __dirname: 'readonly',
        module: 'readonly',
      },
    },
  },
];
