import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { InitialSchema1783920447445 } from '../database/migrations/1783920447445-InitialSchema';
import { AddRoomBlockedDates1783920447446 } from '../database/migrations/1783920447446-AddRoomBlockedDates';
import { TYPEORM_ENTITIES } from '../config/typeorm.entities';
import { EventBus } from '../shared/domain/event.bus';

type Entities = TypeOrmModuleOptions['entities'];

const E2E_DB_STATE_KEY = '__airbnb_e2e_db_state__';

type E2eDbState = {
  initPromise: Promise<void> | null;
};

function getE2eDbState(): E2eDbState {
  const globalState = globalThis as typeof globalThis & {
    [E2E_DB_STATE_KEY]?: E2eDbState;
  };

  if (!globalState[E2E_DB_STATE_KEY]) {
    globalState[E2E_DB_STATE_KEY] = {
      initPromise: null,
    };
  }

  return globalState[E2E_DB_STATE_KEY];
}

function getPostgresConnectionOptions(database?: string) {
  return {
    type: 'postgres' as const,
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USER ?? 'airbnb',
    password: process.env.DB_PASSWORD ?? 'airbnb',
    database: database ?? process.env.DB_NAME ?? 'airbnb_test',
  };
}

async function createAdminDataSource(): Promise<DataSource> {
  const dataSource = new DataSource({
    ...getPostgresConnectionOptions(),
    entities: TYPEORM_ENTITIES,
    migrations: [
      InitialSchema1783920447445,
      AddRoomBlockedDates1783920447446,
    ],
    synchronize: false,
  });
  await dataSource.initialize();
  return dataSource;
}

async function resetSchemaAndMigrate(dataSource: DataSource): Promise<void> {
  await dataSource.query('DROP SCHEMA public CASCADE');
  await dataSource.query('CREATE SCHEMA public');
  await dataSource.query('GRANT ALL ON SCHEMA public TO public');
  await dataSource.runMigrations();
}

async function truncateAllTables(dataSource: DataSource): Promise<void> {
  const tables: Array<{ tablename: string }> = await dataSource.query(`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename <> 'migrations'
  `);

  if (tables.length === 0) {
    return;
  }

  const tableNames = tables.map((table) => `"${table.tablename}"`).join(', ');
  await dataSource.query(
    `TRUNCATE TABLE ${tableNames} RESTART IDENTITY CASCADE`,
  );
}

/**
 * Prepares the Postgres integration database.
 * - First call in the worker: drop schema + run migrations in-process (once).
 * - Later calls: truncate tables only (keeps schema).
 */
export async function prepareIntegrationTestDatabase(): Promise<void> {
  // Prevent duplicate EventBus listeners when Vitest reuses the module graph.
  EventBus.getInstance().clear();

  if (process.env.DB_TYPE === 'sqlite') {
    return;
  }

  const state = getE2eDbState();

  if (!state.initPromise) {
    state.initPromise = (async () => {
      const dataSource = await createAdminDataSource();
      try {
        await resetSchemaAndMigrate(dataSource);
      } finally {
        await dataSource.destroy();
      }
    })();
    await state.initPromise;
    return;
  }

  await state.initPromise;

  const dataSource = await createAdminDataSource();
  try {
    await truncateAllTables(dataSource);
  } finally {
    await dataSource.destroy();
  }
}

export function getIntegrationTestDatabaseConfig(
  entities: Entities = TYPEORM_ENTITIES,
): TypeOrmModuleOptions {
  if (process.env.DB_TYPE === 'sqlite') {
    return {
      type: 'sqlite',
      database: ':memory:',
      synchronize: true,
      entities,
    };
  }

  return {
    ...getPostgresConnectionOptions(),
    synchronize: false,
    migrationsRun: false,
    logging: false,
    entities,
  };
}
