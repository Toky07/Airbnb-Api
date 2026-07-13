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
  test: {
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
          isolate: true,
          fileParallelism: !usesPostgres,
          hookTimeout: usesPostgres ? 30_000 : 10_000,
        },
      },
    ],
  },
});
