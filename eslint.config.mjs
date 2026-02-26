import nx from '@nx/eslint-plugin';
import importPlugin from 'eslint-plugin-import';
import prettierPlugin from 'eslint-plugin-prettier';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.nx/**',
      '**/.vite/**',
      '**/.next/**',
      '**/coverage/**',
      '**/tmp/**',
    ],
  },
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
      'import/no-duplicates': 'error',
      // 'no-restricted-imports': [
      //   'error',
      //   {
      //     patterns: [
      //       // Server files must not import client-only files
      //       {
      //         group: ['**/*.client', '**/*.client.*', '**/client/**'],
      //         message: 'Do not import client-only modules from server code.',
      //       },
      //       // Client files must not import server-only files
      //       {
      //         group: ['**/*.server', '**/*.server.*', '**/server/**'],
      //         message: 'Do not import server-only modules from client code.',
      //       },
      //     ],
      //   },
      // ],

      /* ---------------- Unused ------------------ */
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],

      /* ---------------- Style ------------------- */
      'max-len': ['warn', { code: 120, ignoreUrls: true }],
      curly: ['error', 'all'],

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
            // 0) Side-effect imports first (special prefix)
            ['^\\u0000server-only$'],
            ['^\\u0000'],

            // 1) React / Next
            ['^react$', '^react/', '^next$', '^next/'],

            // 2) Other external packages
            ['^@?\\w'],

            // 3) Internal packages by scope
            ['^@org/'],

            // 4) App absolute alias
            ['^@/'],

            // 5) Types
            ['^@types'],

            // 6) Parent imports
            ['^\\.\\.(?!/?$)', '^\\.\\./?$'],

            // 7) Same-folder imports
            ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],

            // 8) Styles last (note: styles are also side-effect imports => \u0000)
            ['^\\u0000.+\\.s?css$'],
            ['^.+\\.s?css$'],
            // Previous Sort Order
            // ['^react', '^\\w', '^@[^/]'],
            // ['^@org\\/'],
            // ['^@\\/'],
            // ['^@types'],
            // ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
            // ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
            // ['[A-Za-z@\\.].+\\.s?css$'],
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

  {
    files: [
      '**/*.config.{js,jsx,ts,tsx,cjs,mjs}',
      '**/next.config.{js,mjs,ts}',
      '**/jest.config.{js,ts,cjs,mjs}',
      '**/eslint.config.{js,mjs,ts}',
    ],
    rules: {
      'import/no-default-export': 'off',
    },
  },
];
