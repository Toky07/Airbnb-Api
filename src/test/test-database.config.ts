import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { InitialSchema1783920447445 } from '../database/migrations/1783920447445-InitialSchema';
import { AddRoomBlockedDates1783920447446 } from '../database/migrations/1783920447446-AddRoomBlockedDates';
import { AddReservationHoldUntil1783920447447 } from '../database/migrations/1783920447447-AddReservationHoldUntil';
import { AddPropertyCancellationPolicy1783920447448 } from '../database/migrations/1783920447448-AddPropertyCancellationPolicy';
import { AddPaymentRefundFields1783920447449 } from '../database/migrations/1783920447449-AddPaymentRefundFields';
import { AddPropertyTouristTax1783920447450 } from '../database/migrations/1783920447450-AddPropertyTouristTax';
import { AddPaymentPricingBreakdown1783920447451 } from '../database/migrations/1783920447451-AddPaymentPricingBreakdown';
import { AddInvoiceSequences1783920447452 } from '../database/migrations/1783920447452-AddInvoiceSequences';
import { AddDynamicPricing1783920447453 } from '../database/migrations/1783920447453-AddDynamicPricing';
import { AddFavoritesTable1783920447455 } from '../database/migrations/1783920447455-AddFavoritesTable';
import { AddReviewsTable1783920447456 } from '../database/migrations/1783920447456-AddReviewsTable';
import { AddMessagingTables1783920447457 } from '../database/migrations/1783920447457-AddMessagingTables';
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

async function ensureIntegrationTestDatabaseExists(): Promise<void> {
  const database = process.env.DB_NAME ?? 'airbnb_test';
  if (!/^[a-zA-Z0-9_]+$/.test(database)) {
    throw new Error(`Invalid test database name: ${database}`);
  }

  const owner = process.env.DB_USER ?? 'airbnb';
  if (!/^[a-zA-Z0-9_]+$/.test(owner)) {
    throw new Error(`Invalid database owner: ${owner}`);
  }

  const adminDataSource = new DataSource({
    ...getPostgresConnectionOptions('postgres'),
    entities: [],
    synchronize: false,
  });

  await adminDataSource.initialize();
  try {
    const existing: Array<{ exists: boolean }> = await adminDataSource.query(
      'SELECT EXISTS (SELECT 1 FROM pg_database WHERE datname = $1) AS "exists"',
      [database],
    );

    if (!existing[0]?.exists) {
      await adminDataSource.query(
        `CREATE DATABASE "${database}" OWNER "${owner}"`,
      );
    }
  } finally {
    await adminDataSource.destroy();
  }
}

async function createAdminDataSource(): Promise<DataSource> {
  const dataSource = new DataSource({
    ...getPostgresConnectionOptions(),
    entities: TYPEORM_ENTITIES,
    migrations: [
      InitialSchema1783920447445,
      AddRoomBlockedDates1783920447446,
      AddReservationHoldUntil1783920447447,
      AddPropertyCancellationPolicy1783920447448,
      AddPaymentRefundFields1783920447449,
      AddPropertyTouristTax1783920447450,
      AddPaymentPricingBreakdown1783920447451,
      AddInvoiceSequences1783920447452,
      AddDynamicPricing1783920447453,
      AddFavoritesTable1783920447455,
      AddReviewsTable1783920447456,
      AddMessagingTables1783920447457,
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

  await ensureIntegrationTestDatabaseExists();

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
