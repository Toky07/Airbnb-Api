#!/usr/bin/env node
/**
 * Aligne les chemins `media.path` (et avatars) avec les fichiers réellement
 * présents sous /uploads. Utile après un import ou un reset de volume Docker.
 */
import 'dotenv/config';
import { readdir } from 'fs/promises';
import { dirname, join } from 'path';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { MediaOrmEntity } from '../src/modules/media/infrastructure/entities/media-orm.entity';
import { UserEntity } from '../src/modules/user/infrastructure/entities/user.entity';
import { UPLOAD_ROOT } from '../src/modules/media/constant';
import { isStoredUploadPath } from '../src/modules/media/utils/is-stored-upload-path';
import { resolveUploadRoot } from '../src/modules/media/utils/resolve-upload-root';

const IMAGE_EXT = /\.(jpg|jpeg|png|webp|gif)$/i;

async function listImagesInDir(absoluteDir: string): Promise<string[]> {
  try {
    const entries = await readdir(absoluteDir);
    return entries.filter((e) => IMAGE_EXT.test(e)).sort((a, b) => a.localeCompare(b));
  } catch {
    return [];
  }
}

async function bootstrap(): Promise<void> {
  console.log('Réconciliation media DB ↔ disque...\n');

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    const dataSource = app.get(DataSource);
    const mediaRepo = dataSource.getRepository(MediaOrmEntity);
    const userRepo = dataSource.getRepository(UserEntity);
    const uploadRoot = resolveUploadRoot();
    const absoluteRoot = join(process.cwd(), uploadRoot);

    const rows = await mediaRepo.find({ order: { id: 'ASC' } });
    const byDir = new Map<string, MediaOrmEntity[]>();

    for (const row of rows) {
      if (!isStoredUploadPath(row.path)) continue;
      const dir = dirname(row.path.replace(/\\/g, '/'));
      const list = byDir.get(dir) ?? [];
      list.push(row);
      byDir.set(dir, list);
    }

    let updated = 0;
    let removed = 0;

    for (const [relDir, mediaRows] of byDir) {
      const sub = relDir.startsWith(`${UPLOAD_ROOT}/`)
        ? relDir.slice(UPLOAD_ROOT.length + 1)
        : relDir;
      const files = await listImagesInDir(join(absoluteRoot, sub));

      mediaRows.sort((a, b) => a.id - b.id);

      for (let i = 0; i < mediaRows.length; i++) {
        const row = mediaRows[i]!;
        const file = files[i];
        if (!file) {
          await mediaRepo.delete(row.id);
          removed += 1;
          continue;
        }
        const nextPath = `${relDir}/${file}`.replace(/\\/g, '/');
        if (row.path !== nextPath) {
          row.path = nextPath;
          await mediaRepo.save(row);
          updated += 1;
        }
      }
    }

    let avatars = 0;
    const users = await userRepo.find();
    for (const user of users) {
      if (!user.avatar || !isStoredUploadPath(user.avatar)) continue;
      const relDir = dirname(user.avatar.replace(/\\/g, '/'));
      const sub = relDir.startsWith(`${UPLOAD_ROOT}/`)
        ? relDir.slice(UPLOAD_ROOT.length + 1)
        : relDir;
      const files = await listImagesInDir(join(absoluteRoot, sub));
      const next = files[0] ? `${relDir}/${files[0]}`.replace(/\\/g, '/') : null;
      if (next && user.avatar !== next) {
        user.avatar = next;
        await userRepo.save(user);
        avatars += 1;
      }
    }

    console.log(`Media mis à jour : ${updated}`);
    console.log(`Media orphelins (DB sans fichier) supprimés : ${removed}`);
    console.log(`Avatars mis à jour : ${avatars}`);
  } finally {
    await app.close();
  }
}

bootstrap().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
