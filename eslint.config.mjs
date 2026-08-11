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
  {
    files: ['src/modules/authentication/**/*.ts'],
    ignores: ['**/*.spec.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '**/user/applications/**',
                '**/user/domain/**',
                '**/user/interfaces/**',
                '**/user/infrastructure/repositories/**',
              ],
              message:
                'Importer user uniquement via user/contracts (sauf UserModule / ORM UserEntity).',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/modules/user/**/*.ts'],
    ignores: [
      '**/*.spec.ts',
      'src/modules/user/infrastructure/**',
      'src/modules/user/user.module.ts',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '**/authentication/applications/**',
                '**/authentication/domain/**',
                '**/authentication/interfaces/**',
              ],
              message:
                'Importer authentication uniquement via authentication/contracts (sauf AuthModule / ORM AuthEntity).',
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      'src/modules/amenity/**/*.ts',
      'src/modules/host/**/*.ts',
      'src/modules/reservation/**/*.ts',
      'src/modules/cart/**/*.ts',
      'src/modules/favorite/**/*.ts',
      'src/modules/messaging/**/*.ts',
      'src/modules/import/**/*.ts',
      'src/modules/authentication/**/*.ts',
      'src/modules/review/**/*.ts',
    ],
    ignores: [
      '**/*.spec.ts',
      '**/infrastructure/entities/**',
      '**/infrastructure/repositories/**',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '**/properties/applications/**',
                '**/properties/domain/**',
                '**/properties/interfaces/**',
                '**/properties/infrastructure/repositories/**',
              ],
              message:
                'Importer properties uniquement via properties/contracts (sauf PropertiesModule / ORM).',
            },
            {
              group: [
                '**/rooms/applications/**',
                '**/rooms/domain/**',
                '**/rooms/interfaces/**',
                '**/rooms/infrastructure/repositories/**',
                '**/rooms/infrastructure/adapters/**',
              ],
              message:
                'Importer rooms uniquement via rooms/contracts (sauf RoomsModule / ORM).',
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      'src/modules/host/**/*.ts',
      'src/modules/review/**/*.ts',
      'src/modules/messaging/**/*.ts',
      'src/modules/rooms/**/*.ts',
      'src/modules/cart/**/*.ts',
      'src/modules/payment/**/*.ts',
      'src/modules/favorite/**/*.ts',
      'src/modules/invoice/**/*.ts',
      'src/modules/mail/**/*.ts',
    ],
    ignores: [
      '**/*.spec.ts',
      '**/infrastructure/entities/**',
      '**/infrastructure/repositories/**',
      // ORM / Nest wiring exceptions
      'src/modules/rooms/room.module.ts',
      'src/modules/rooms/rooms.bootstrap.ts',
      'src/modules/messaging/messaging.module.ts',
      'src/modules/review/review.module.ts',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '**/reservation/applications/**',
                '**/reservation/domain/**',
                '**/reservation/interfaces/**',
                '**/reservation/infrastructure/repositories/**',
              ],
              message:
                'Importer reservation uniquement via reservation/contracts (sauf ReservationModule / ORM).',
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      'src/modules/user/**/*.ts',
      'src/modules/rooms/**/*.ts',
      'src/modules/reservation/**/*.ts',
      'src/modules/payment/**/*.ts',
      'src/modules/host/**/*.ts',
      'src/modules/review/**/*.ts',
      'src/modules/messaging/**/*.ts',
      'src/modules/favorite/**/*.ts',
      'src/modules/invoice/**/*.ts',
      'src/modules/mail/**/*.ts',
    ],
    ignores: [
      '**/*.spec.ts',
      '**/infrastructure/entities/**',
      '**/infrastructure/repositories/**',
      'src/modules/reservation/reservation.module.ts',
      'src/modules/rooms/room.module.ts',
      'src/modules/user/user.module.ts',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '**/cart/applications/**',
                '**/cart/domain/**',
                '**/cart/interfaces/**',
                '**/cart/infrastructure/**',
              ],
              message:
                'Importer cart uniquement via cart/contracts (sauf CartModule / ORM).',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/modules/host/**/*.ts', 'src/modules/rooms/**/*.ts'],
    ignores: [
      '**/*.spec.ts',
      '**/infrastructure/entities/**',
      'src/modules/host/host.module.ts',
      'src/modules/rooms/room.module.ts',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '**/amenity/applications/**',
                '**/amenity/domain/**',
                '**/amenity/interfaces/**',
                '**/amenity/infrastructure/**',
              ],
              message:
                'Importer amenity uniquement via amenity/contracts (sauf AmenityModule / ORM).',
            },
          ],
        },
      ],
    },
  },
);
