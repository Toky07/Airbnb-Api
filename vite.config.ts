import path from 'node:path';
import { defineConfig } from 'vitest/config';

const usesPostgres = process.env.DB_TYPE !== 'sqlite';

const shared = {
  globals: true,
  setupFiles: ['./src/test/vitest.setup.ts'],
  pool: 'threads' as const,
  deps: {
    optimizer: {
      ssr: {
        enabled: true,
      },
    },
  },
};

export default defineConfig({
  plugins: [],
  resolve: {
    alias: {
      '@src': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.spec.ts',
        'src/**/*.controller.spec.ts',
        'src/**/main.ts',
        'src/database/migrations/**',
        'src/config/typeorm-cli.config.ts',
      ],
    },
    projects: [
      {
        extends: true,
        test: {
          ...shared,
          name: 'unit',
          setupFiles: [
            './src/test/vitest.setup.ts',
            './src/test/vitest.unit.setup.ts',
          ],
          include: ['src/**/*.spec.ts'],
          exclude: ['**/*.controller.spec.ts'],
          isolate: false,
        },
      },
      {
        extends: true,
        test: {
          ...shared,
          name: 'e2e',
          setupFiles: [
            './src/test/vitest.setup.ts',
            './src/test/vitest.e2e.setup.ts',
          ],
          include: ['**/*.controller.spec.ts'],
          // Share the module graph + Nest app across files: Postgres suite is
          // sequential, and re-booting Nest/TypeORM per file dominated runtime.
          isolate: false,
          fileParallelism: !usesPostgres,
          hookTimeout: usesPostgres ? 30_000 : 10_000,
        },
      },
    ],
  },
});
