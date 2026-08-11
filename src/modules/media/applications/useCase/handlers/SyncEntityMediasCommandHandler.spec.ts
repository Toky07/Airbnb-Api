import { describe, expect, it } from 'vitest';
import { ENTITY_TYPE } from '@src/modules/media/constant';
import { Media } from '@src/modules/media/domain/entities/media.entity';
import type { IMediaRepository } from '@src/modules/media/domain/repositories/media.repository';
import type { ILocalStorageService } from '@src/modules/media/services/localStorage.service';
import { SyncEntityMediasCommandHandler } from './SyncEntityMediasCommandHandler';
import { SyncEntityMediasCommand } from '@src/modules/media/applications/useCase/commands/SyncEntityMediasCommand';

describe('SyncEntityMediasCommandHandler', () => {
  it('should sync kept, deleted and new medias', async () => {
    const existing = [
      new Media('uploads/1/room/2/a.jpg', 'image', ENTITY_TYPE.ROOM, 2, 1),
      new Media('uploads/1/room/2/b.jpg', 'image', ENTITY_TYPE.ROOM, 2, 2),
    ];

    const repository = {
      findByEntity: async () => existing,
      delete: async () => undefined,
      create: async (media: Media) =>
        new Media(media.path, media.type, media.entityType, media.entityId, 3),
    } as IMediaRepository;

    const deletedPaths: string[] = [];
    const createdPaths: string[] = [];
    const storage = {
      delete: async (path: string) => {
        deletedPaths.push(path);
      },
      save: async () => {
        const path = 'uploads/1/room/2/c.jpg';
        createdPaths.push(path);
        return path;
      },
    } as ILocalStorageService;

    const handler = new SyncEntityMediasCommandHandler(repository, storage);

    await handler.execute(
      new SyncEntityMediasCommand(
        ENTITY_TYPE.ROOM,
        2,
        {
          keptPaths: ['uploads/1/room/2/a.jpg'],
          newFiles: [
            {
              buffer: Buffer.from('new'),
              originalname: 'c.jpg',
              mimetype: 'image/jpeg',
            },
          ],
        },
        undefined,
        1,
      ),
    );

    expect(deletedPaths).toEqual(['uploads/1/room/2/b.jpg']);
    expect(createdPaths).toEqual(['uploads/1/room/2/c.jpg']);
  });
});
