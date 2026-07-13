import type { TypeOrmModuleOptions } from '@nestjs/typeorm';

type Entities = TypeOrmModuleOptions['entities'];

export function getIntegrationTestDatabaseConfig(
  entities: Entities,
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
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USER ?? 'airbnb',
    password: process.env.DB_PASSWORD ?? 'airbnb',
    database: process.env.DB_NAME ?? 'airbnb_test',
    synchronize: true,
    dropSchema: true,
    logging: false,
    entities,
  };
}
