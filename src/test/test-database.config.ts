import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { InitialSchema1783920447445 } from '@src/database/migrations/1783920447445-InitialSchema';
import { AddRoomBlockedDates1783920447446 } from '@src/database/migrations/1783920447446-AddRoomBlockedDates';
import { AddReservationHoldUntil1783920447447 } from '@src/database/migrations/1783920447447-AddReservationHoldUntil';
import { AddPropertyCancellationPolicy1783920447448 } from '@src/database/migrations/1783920447448-AddPropertyCancellationPolicy';
import { AddPaymentRefundFields1783920447449 } from '@src/database/migrations/1783920447449-AddPaymentRefundFields';
import { AddPropertyTouristTax1783920447450 } from '@src/database/migrations/1783920447450-AddPropertyTouristTax';
import { AddPaymentPricingBreakdown1783920447451 } from '@src/database/migrations/1783920447451-AddPaymentPricingBreakdown';
import { AddInvoiceSequences1783920447452 } from '@src/database/migrations/1783920447452-AddInvoiceSequences';
import { AddDynamicPricing1783920447453 } from '@src/database/migrations/1783920447453-AddDynamicPricing';
import { AddPasswordResetTokens1783920447454 } from '@src/database/migrations/1783920447454-AddPasswordResetTokens';
import { AddFavoritesTable1783920447455 } from '@src/database/migrations/1783920447455-AddFavoritesTable';
import { AddReviewsTable1783920447456 } from '@src/database/migrations/1783920447456-AddReviewsTable';
import { AddMessagingTables1783920447457 } from '@src/database/migrations/1783920447457-AddMessagingTables';
import { AddHostApplicationsTable1783920447458 } from '@src/database/migrations/1783920447458-AddHostApplicationsTable';
import { AddStripeConnectFields1783920447459 } from '@src/database/migrations/1783920447459-AddStripeConnectFields';
import { AddPropertyArrivalGuide1783920447460 } from '@src/database/migrations/1783920447460-AddPropertyArrivalGuide';
import { TYPEORM_ENTITIES } from '@src/config/typeorm.entities';
import { EventBus } from '@src/shared/domain/event.bus';

type Entities = TypeOrmModuleOptions['entities'];

const E2E_DB_STATE_KEY = '__airbnb_e2e_db_state__';

type E2eDbState = {
  initPromise: Promise<void> | null;
  adminDataSource: DataSource | null;
};

function getE2eDbState(): E2eDbState {
  const globalState = globalThis as typeof globalThis & {
    [E2E_DB_STATE_KEY]?: E2eDbState;
  };

  if (!globalState[E2E_DB_STATE_KEY]) {
    globalState[E2E_DB_STATE_KEY] = {
      initPromise: null,
      adminDataSource: null,
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
      AddReservationHoldUntil1783920447447,
      AddPropertyCancellationPolicy1783920447448,
      AddPaymentRefundFields1783920447449,
      AddPropertyTouristTax1783920447450,
      AddPaymentPricingBreakdown1783920447451,
      AddInvoiceSequences1783920447452,
      AddDynamicPricing1783920447453,
      AddPasswordResetTokens1783920447454,
      AddFavoritesTable1783920447455,
      AddReviewsTable1783920447456,
      AddMessagingTables1783920447457,
      AddHostApplicationsTable1783920447458,
      AddStripeConnectFields1783920447459,
      AddPropertyArrivalGuide1783920447460,
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

async function truncateAllTables(
  dataSource: DataSource,
  preserveTables: string[] = [],
): Promise<void> {
  const preserved = new Set(['migrations', ...preserveTables]);
  const tables: Array<{ tablename: string }> = await dataSource.query(`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
  `);

  const tableNames = tables
    .map((table) => table.tablename)
    .filter((name) => !preserved.has(name))
    .map((name) => `"${name}"`)
    .join(', ');

  if (!tableNames) {
    return;
  }

  await dataSource.query(
    `TRUNCATE TABLE ${tableNames} RESTART IDENTITY CASCADE`,
  );
}

/** Catalog tables seeded once at Nest boot; keep them between e2e files. */
export const E2E_PRESERVED_CATALOG_TABLES = [
  'permissions',
  'roles',
  'role_permissions',
  'property_types',
  'room_types',
  'amenities',
] as const;

/** Truncate public tables (schema kept). */
export async function truncateIntegrationTables(
  dataSource: DataSource,
  options?: { preserveCatalog?: boolean },
): Promise<void> {
  if (process.env.DB_TYPE === 'sqlite') {
    return;
  }

  await truncateAllTables(
    dataSource,
    options?.preserveCatalog ? [...E2E_PRESERVED_CATALOG_TABLES] : [],
  );
}

async function getOrCreateAdminDataSource(): Promise<DataSource> {
  const state = getE2eDbState();
  if (state.adminDataSource?.isInitialized) {
    return state.adminDataSource;
  }

  state.adminDataSource = await createAdminDataSource();
  return state.adminDataSource;
}

/**
 * Prepares the Postgres integration database.
 * - First call in the worker: drop schema + run migrations in-process (once).
 * - Later calls: truncate tables only (keeps schema).
 */
export async function prepareIntegrationTestDatabase(): Promise<void> {
  // Prevent duplicate EventBus listeners when Vitest reuses the module graph
  // and each controller file boots its own Nest app.
  EventBus.getInstance().clear();

  if (process.env.DB_TYPE === 'sqlite') {
    return;
  }

  const state = getE2eDbState();

  if (!state.initPromise) {
    state.initPromise = (async () => {
      const dataSource = await getOrCreateAdminDataSource();
      await resetSchemaAndMigrate(dataSource);
    })();
    await state.initPromise;
    return;
  }

  await state.initPromise;
  await truncateAllTables(await getOrCreateAdminDataSource());
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
