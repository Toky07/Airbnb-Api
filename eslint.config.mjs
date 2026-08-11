// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  },
  {
    files: [
      '**/*.spec.ts',
      '**/*.controller.spec.ts',
      '**/*-test.helpers.ts',
      '**/test-helpers/**',
      'src/test/**',
    ],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
  {
    files: ['src/modules/cart/**/*.ts', 'src/modules/reservation/**/*.ts'],
    ignores: [
      'src/modules/cart/**/*.spec.ts',
      'src/modules/reservation/**/*.spec.ts',
      'src/modules/reservation/infrastructure/entities/**',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '**/payment/applications/**',
                '**/payment/infrastructure/**',
                '**/payment/interfaces/**',
                '**/payment/domain/**',
              ],
              message:
                'Importer payment uniquement via payment/contracts (sauf ORM TypeORM).',
            },
            {
              group: [
                '**/invoice/applications/**',
                '**/invoice/infrastructure/**',
                '**/invoice/domain/**',
              ],
              message:
                'Importer invoice uniquement via invoice/contracts (sauf ORM TypeORM).',
            },
            {
              group: [
                '**/mail/applications/**',
                '**/mail/infrastructure/**',
                '**/mail/domain/**',
              ],
              message:
                'Importer mail uniquement via mail/contracts (sauf ORM TypeORM).',
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      'src/modules/rooms/**/*.ts',
      'src/modules/properties/**/*.ts',
      'src/modules/host/**/*.ts',
      'src/modules/user/**/*.ts',
      'src/modules/import/**/*.ts',
      'src/modules/authentication/**/*.ts',
    ],
    ignores: ['**/*.spec.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '**/media/applications/**',
                '**/media/infrastructure/**',
                '**/media/domain/**',
                '**/media/types/**',
                '**/media/utils/**',
                '**/media/services/**',
                '**/media/constant',
                '**/media/constant.ts',
              ],
              message:
                'Importer media uniquement via media/contracts (sauf MediaModule / ORM).',
            },
            {
              group: [
                '**/mail/applications/**',
                '**/mail/infrastructure/**',
                '**/mail/domain/**',
              ],
              message:
                'Importer mail uniquement via mail/contracts (sauf MailModule / ORM).',
            },
          ],
        },
      ],
    },
  },
);
