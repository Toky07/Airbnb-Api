import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { TYPEORM_ENTITIES } from './typeorm.entities';
import { getMigrationsGlob } from './typeorm-options';

export function getDatabaseConfig(): TypeOrmModuleOptions {
  const dbType = process.env.DB_TYPE ?? 'sqlite';

  if (dbType === 'postgres') {
    return {
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 5432),
      username: process.env.DB_USER ?? 'airbnb',
      password: process.env.DB_PASSWORD ?? 'airbnb',
      database: process.env.DB_NAME ?? 'airbnb',
      synchronize: false,
      migrationsRun: true,
      autoLoadEntities: true,
      entities: TYPEORM_ENTITIES,
      migrations: [getMigrationsGlob()],
    };
  }

  return {
    type: 'sqlite',
    database: process.env.DB_SQLITE_PATH ?? 'database.sqlite',
    synchronize: false,
    autoLoadEntities: true,
    entities: TYPEORM_ENTITIES,
  };
}
