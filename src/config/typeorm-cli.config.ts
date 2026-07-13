import 'dotenv/config';
import { DataSource } from 'typeorm';
import { getPostgresDataSourceOptions } from './typeorm-options';

export default new DataSource(getPostgresDataSourceOptions());
