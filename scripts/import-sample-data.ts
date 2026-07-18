#!/usr/bin/env node
import 'dotenv/config';
import { readFileSync } from 'fs';
import { join } from 'path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { CommandBus } from '../src/shared/useCase/bus/bus';
import { ImportDataCommand } from '../src/modules/import/applications/useCase/commands/ImportDataCommand';
import type { ImportBatchResult } from '../src/modules/import/applications/dto/import-batch.dto';
import { DataSource } from 'typeorm';
import { parseCsv } from './lib/parse-csv';
import {
  mapPropertyRows,
  mapRoomRows,
  mapUserRows,
} from './lib/csv-mappers';
import { ensureAdminUser } from './lib/ensure-admin-user';

const SAMPLE_DATA_DIR = join(__dirname, '..', 'sample-data');

function readCsvFile(fileName: string): Record<string, string>[] {
  const filePath = join(SAMPLE_DATA_DIR, fileName);
  const content = readFileSync(filePath, 'utf-8');
  return parseCsv(content);
}

function printImportSummary(result: ImportBatchResult): void {
  const { created, errors } = result;

  console.log('\nRésumé de l’import :');
  console.log(`  - Utilisateurs : ${created.users}`);
  console.log(`  - Établissements : ${created.properties}`);
  console.log(`  - Chambres : ${created.rooms}`);

  if (errors.length > 0) {
    console.log(`\n${errors.length} erreur(s) :`);
    for (const error of errors.slice(0, 20)) {
      console.log(
        `  - [${error.entity} #${error.index}] ${error.field ? `${error.field}: ` : ''}${error.message}`,
      );
    }
    if (errors.length > 20) {
      console.log(`  ... et ${errors.length - 20} autre(s) erreur(s).`);
    }
  }
}

async function bootstrap(): Promise<void> {
  process.env.MAIL_TRANSPORT = process.env.MAIL_TRANSPORT ?? 'console';

  console.log('Démarrage de l’import des données d’exemple...\n');

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const dataSource = app.get(DataSource);

    console.log('1/4 — Création de l’utilisateur admin...');
    await ensureAdminUser(dataSource);

    console.log('2/4 — Lecture de users.csv...');
    const users = mapUserRows(readCsvFile('users.csv'));
    console.log(`     ${users.length} utilisateur(s) à importer.`);

    console.log('3/4 — Lecture de properties.csv...');
    const properties = mapPropertyRows(readCsvFile('properties.csv'));
    console.log(`     ${properties.length} établissement(s) à importer.`);

    console.log('4/4 — Lecture de rooms.csv...');
    const rooms = mapRoomRows(readCsvFile('rooms.csv'));
    console.log(`     ${rooms.length} chambre(s) à importer.`);

    console.log('\nImport en cours (téléchargement des images inclus)...');
    const result = await CommandBus.execute<ImportBatchResult>(
      new ImportDataCommand({
        users,
        properties,
        rooms,
      }),
    );

    printImportSummary(result);

    if (errorsPreventSuccess(result.errors)) {
      process.exitCode = 1;
    } else {
      console.log('\nImport terminé avec succès.');
    }
  } finally {
    await app.close();
  }
}

function errorsPreventSuccess(
  errors: ImportBatchResult['errors'],
): boolean {
  return errors.some((error) => !error.message.includes('existe déjà'));
}

bootstrap().catch((error: unknown) => {
  console.error('\nÉchec de l’import :');
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
