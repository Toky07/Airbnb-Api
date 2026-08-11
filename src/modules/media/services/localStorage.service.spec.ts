import { afterEach, describe, expect, it } from 'vitest';
import { readFile, rm } from 'fs/promises';
import { join } from 'path';
import { ENTITY_TYPE } from '@src/modules/media/constant';
import { LocalStorageService } from './localStorage.service';
import type { UploadFile } from '@src/modules/media/types/upload-file';
import {
  toDiskPath,
  toSaveMediaContext,
} from '@src/modules/media/utils/build-upload-path';
import { resolveUploadRoot } from '@src/modules/media/utils/resolve-upload-root';

describe('LocalStorageService', () => {
  const service = new LocalStorageService();
  const diskRoot = resolveUploadRoot();

  afterEach(async () => {
    await rm(join(process.cwd(), diskRoot), {
      recursive: true,
      force: true,
    }).catch(() => undefined);
  });

  it('should save a property image under uploads/{propertyId}/property', async () => {
    const file = {
      buffer: Buffer.from('test-image'),
      originalname: 'test.png',
      mimetype: 'image/png',
    } as UploadFile;

    const relativePath = await service.save(
      file,
      toSaveMediaContext(ENTITY_TYPE.PROPERTY, 42),
    );

    expect(relativePath).toContain('uploads/42/property/');
    expect(relativePath).toMatch(/\.png$/);

    const content = await readFile(toDiskPath(relativePath, diskRoot));
    expect(content.toString()).toBe('test-image');
  });

  it('should save a user avatar under uploads/users/{userId}/avatar', async () => {
    const file = {
      buffer: Buffer.from('user-avatar'),
      originalname: 'avatar.jpg',
      mimetype: 'image/jpeg',
    } as UploadFile;

    const relativePath = await service.save(
      file,
      toSaveMediaContext(ENTITY_TYPE.USER, 7),
    );

    expect(relativePath).toContain('uploads/users/7/avatar/');
    expect(relativePath).toMatch(/\.jpg$/);
  });

  it('should save a room image under uploads/{propertyId}/room/{roomId}', async () => {
    const file = {
      buffer: Buffer.from('room-image'),
      originalname: 'room.jpg',
      mimetype: 'image/jpeg',
    } as UploadFile;

    const relativePath = await service.save(
      file,
      toSaveMediaContext(ENTITY_TYPE.ROOM, 5, 3),
    );

    expect(relativePath).toContain('uploads/3/room/5/');
    expect(relativePath).toMatch(/\.jpg$/);
  });

  it('should delete a saved file', async () => {
    const relativePath = 'uploads/99/property/to-delete.jpg';
    const absolutePath = toDiskPath(relativePath, diskRoot);
    await service.save(
      {
        buffer: Buffer.from('delete-me'),
        originalname: 'to-delete.jpg',
        mimetype: 'image/jpeg',
      } as UploadFile,
      toSaveMediaContext(ENTITY_TYPE.PROPERTY, 99),
    );

    await service.delete(relativePath);

    await expect(readFile(absolutePath)).rejects.toThrow();
  });
});
