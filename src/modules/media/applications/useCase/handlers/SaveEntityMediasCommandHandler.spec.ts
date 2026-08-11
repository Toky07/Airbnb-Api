import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ENTITY_TYPE, MEDIA_TYPE } from '@src/modules/media/constant';
import { Media } from '@src/modules/media/domain/entities/media.entity';
import type { IMediaRepository } from '@src/modules/media/domain/repositories/media.repository';
import type { ILocalStorageService } from '@src/modules/media/services/localStorage.service';
import type { UploadFile } from '@src/modules/media/types/upload-file';
import { DeleteMediasByEntityCommandHandler } from './DeleteMediasByEntityCommandHandler';
import { SaveEntityMediasCommandHandler } from './SaveEntityMediasCommandHandler';
import { SaveEntityMediasCommand } from '@src/modules/media/applications/useCase/commands/SaveEntityMediasCommand';
import { DeleteMediasByEntityCommand } from '@src/modules/media/applications/useCase/commands/DeleteMediasByEntityCommand';

describe('SaveEntityMediasCommandHandler', () => {
  it('should save medias for any entity type', async () => {
    const file = {
      buffer: Buffer.from('image'),
      originalname: 'photo.jpg',
      mimetype: 'image/jpeg',
    } as UploadFile;

    const repository = {
      create: async (media: Media) =>
        new Media(media.path, media.type, media.entityType, media.entityId, 1),
    } as IMediaRepository;

    const storage = {
      save: async () => 'uploads/2/property/photo.jpg',
    } as ILocalStorageService;

    let deleted = false;
    const deleteMediasByEntity = {
      execute: async () => {
        deleted = true;
      },
    } as DeleteMediasByEntityCommandHandler;

    const handler = new SaveEntityMediasCommandHandler(
      repository,
      storage,
      deleteMediasByEntity,
    );

    const result = await handler.execute(
      new SaveEntityMediasCommand(ENTITY_TYPE.PROPERTY, 2, [file]),
    );

    expect(deleted).toBe(true);
    expect(result).toHaveLength(1);
    expect(result[0].entityType).toBe(ENTITY_TYPE.PROPERTY);
    expect(result[0].type).toBe(MEDIA_TYPE.IMAGE);
  });

  it('should save multiple medias for room entity', async () => {
    const files = [
      {
        buffer: Buffer.from('1'),
        originalname: 'a.jpg',
        mimetype: 'image/jpeg',
      },
      {
        buffer: Buffer.from('2'),
        originalname: 'b.jpg',
        mimetype: 'image/jpeg',
      },
    ] as UploadFile[];

    let createCount = 0;
    const repository = {
      create: async (media: Media) => {
        createCount += 1;
        return new Media(
          media.path,
          media.type,
          media.entityType,
          media.entityId,
          createCount,
        );
      },
    } as IMediaRepository;

    let saveCount = 0;
    const storage = {
      save: async () => {
        saveCount += 1;
        return `uploads/3/room/5/${saveCount}.jpg`;
      },
    } as ILocalStorageService;

    const handler = new SaveEntityMediasCommandHandler(repository, storage, {
      execute: async () => undefined,
    } as DeleteMediasByEntityCommandHandler);

    const result = await handler.execute(
      new SaveEntityMediasCommand(
        ENTITY_TYPE.ROOM,
        5,
        files,
        MEDIA_TYPE.IMAGE,
        3,
      ),
    );

    expect(result).toHaveLength(2);
    expect(result[0].entityType).toBe(ENTITY_TYPE.ROOM);
  });

  it('should return empty array when no files provided', async () => {
    const handler = new SaveEntityMediasCommandHandler(
      {} as IMediaRepository,
      {} as ILocalStorageService,
      {} as DeleteMediasByEntityCommandHandler,
    );

    const result = await handler.execute(
      new SaveEntityMediasCommand(ENTITY_TYPE.ROOM, 1, []),
    );
    expect(result).toEqual([]);
  });

  it('should reject when exceeding entity media limit', async () => {
    const files = [
      {
        buffer: Buffer.from('1'),
        originalname: 'a.jpg',
        mimetype: 'image/jpeg',
      },
      {
        buffer: Buffer.from('2'),
        originalname: 'b.jpg',
        mimetype: 'image/jpeg',
      },
    ] as UploadFile[];

    const handler = new SaveEntityMediasCommandHandler(
      {} as IMediaRepository,
      {} as ILocalStorageService,
      {} as DeleteMediasByEntityCommandHandler,
    );

    await expect(
      handler.execute(
        new SaveEntityMediasCommand(ENTITY_TYPE.PROPERTY, 1, files),
      ),
    ).rejects.toThrow('Maximum 1 media file(s) allowed');
  });
});

describe('DeleteMediasByEntityCommandHandler', () => {
  it('should delete medias from repository and storage', async () => {
    const repository = {
      deleteByEntity: async () => [
        new Media(
          'uploads/1/property/a.jpg',
          'image',
          ENTITY_TYPE.PROPERTY,
          1,
          1,
        ),
      ],
    } as IMediaRepository;

    const deletedPaths: string[] = [];
    const storage = {
      deleteMany: async (paths: string[]) => {
        deletedPaths.push(...paths);
      },
    } as ILocalStorageService;

    const handler = new DeleteMediasByEntityCommandHandler(repository, storage);

    await handler.execute(
      new DeleteMediasByEntityCommand(ENTITY_TYPE.PROPERTY, 1),
    );

    expect(deletedPaths).toEqual(['uploads/1/property/a.jpg']);
  });
});
