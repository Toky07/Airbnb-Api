import { describe, expect, it } from 'vitest';
import { ENTITY_TYPE } from '../../constant';
import { Media } from '../../domain/entities/media.entity';
import { SyncEntityMediasUseCase } from './syncEntityMedias.usecase';

describe('SyncEntityMediasUseCase', () => {
  it('supprime les médias non conservés et ajoute les nouveaux fichiers', async () => {
    const existing = [
      new Media('uploads/rooms/1/a.jpg', 'image', ENTITY_TYPE.ROOM, 1, 1),
      new Media('uploads/rooms/1/b.jpg', 'image', ENTITY_TYPE.ROOM, 1, 2),
    ];

    const deletedIds: number[] = [];
    const deletedPaths: string[] = [];
    const createdPaths: string[] = [];

    const repository = {
      findByEntity: async () => existing,
      delete: async (id: number) => {
        deletedIds.push(id);
        return true;
      },
      create: async (media: Media) => {
        createdPaths.push(media.path);
        return media;
      },
    };

    const storage = {
      delete: async (path: string) => {
        deletedPaths.push(path);
      },
      save: async () => 'uploads/rooms/1/c.jpg',
    };

    const useCase = new SyncEntityMediasUseCase(
      repository as never,
      storage as never,
    );

    await useCase.execute(ENTITY_TYPE.ROOM, 1, {
      keptPaths: ['uploads/rooms/1/a.jpg'],
      newFiles: [{ buffer: Buffer.from('c'), originalname: 'c.jpg' } as never],
    });

    expect(deletedIds).toEqual([2]);
    expect(deletedPaths).toEqual(['uploads/rooms/1/b.jpg']);
    expect(createdPaths).toEqual(['uploads/rooms/1/c.jpg']);
  });
});
