import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { execSync } from 'node:child_process';
import { join } from 'node:path';
import { DataSource } from 'typeorm';
import { TYPEORM_ENTITIES } from '../config/typeorm.entities';

type Entities = TypeOrmModuleOptions['entities'];

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

function runMigrationsViaCli(): void {
  const apiRoot = join(__dirname, '..', '..');

  execSync(
    'npx typeorm-ts-node-commonjs migration:run -d src/config/typeorm-cli.config.ts',
    {
      cwd: apiRoot,
      env: {
        ...process.env,
        TS_NODE_PROJECT: 'tsconfig.typeorm.json',
        DB_TYPE: 'postgres',
        DB_HOST: process.env.DB_HOST ?? 'localhost',
        DB_PORT: process.env.DB_PORT ?? '5432',
        DB_USER: process.env.DB_USER ?? 'airbnb',
        DB_PASSWORD: process.env.DB_PASSWORD ?? 'airbnb',
        DB_NAME: process.env.DB_NAME ?? 'airbnb_test',
      },
      stdio: 'pipe',
    },
  );
}

export async function prepareIntegrationTestDatabase(): Promise<void> {
  if (process.env.DB_TYPE === 'sqlite') {
    return;
  }

  const dataSource = new DataSource({
    ...getPostgresConnectionOptions(),
    entities: TYPEORM_ENTITIES,
    synchronize: false,
  });

  await dataSource.initialize();

  try {
    await dataSource.query('DROP SCHEMA public CASCADE');
    await dataSource.query('CREATE SCHEMA public');
    await dataSource.query('GRANT ALL ON SCHEMA public TO public');
  } finally {
    await dataSource.destroy();
  }

  runMigrationsViaCli();
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
