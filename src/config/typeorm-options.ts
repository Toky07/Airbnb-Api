import { join } from 'path';
import type { DataSourceOptions } from 'typeorm';
import { TYPEORM_ENTITIES } from './typeorm.entities';

export function getMigrationsGlob(): string {
  return join(__dirname, '..', 'database', 'migrations', '*.{js,ts}');
}

export function getPostgresDataSourceOptions(
  overrides: Partial<DataSourceOptions> = {},
): DataSourceOptions {
  return {
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USER ?? 'airbnb',
    password: process.env.DB_PASSWORD ?? 'airbnb',
    database: process.env.DB_NAME ?? 'airbnb',
    entities: TYPEORM_ENTITIES,
    migrations: [getMigrationsGlob()],
    synchronize: false,
    ...overrides,
  } as DataSourceOptions;
}
