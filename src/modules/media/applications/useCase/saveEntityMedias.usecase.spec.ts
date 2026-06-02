import { ENTITY_TYPE, MEDIA_TYPE } from '../../constant';
import { Media } from '../../domain/entities/media.entity';
import type { IMediaRepository } from '../../domain/repositories/media.repository';
import type { ILocalStorageService } from '../../services/localStorage.service';
import type { UploadFile } from '../../types/upload-file';
import { DeleteMediasByEntityUseCase } from './deleteMediasByEntity.usecase';
import { SaveEntityMediasUseCase } from './saveEntityMedias.usecase';

describe('SaveEntityMediasUseCase', () => {
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
      save: async () => 'uploads/properties/2/photo.jpg',
    } as ILocalStorageService;

    let deleted = false;
    const deleteMediasByEntity = {
      execute: async () => {
        deleted = true;
      },
    } as DeleteMediasByEntityUseCase;

    const useCase = new SaveEntityMediasUseCase(
      repository,
      storage,
      deleteMediasByEntity,
    );

    const result = await useCase.execute(ENTITY_TYPE.PROPERTY, 2, [file]);

    expect(deleted).toBe(true);
    expect(result).toHaveLength(1);
    expect(result[0].entityType).toBe(ENTITY_TYPE.PROPERTY);
    expect(result[0].type).toBe(MEDIA_TYPE.IMAGE);
  });

  it('should save multiple medias for room entity', async () => {
    const files = [
      { buffer: Buffer.from('1'), originalname: 'a.jpg', mimetype: 'image/jpeg' },
      { buffer: Buffer.from('2'), originalname: 'b.jpg', mimetype: 'image/jpeg' },
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
        return `uploads/rooms/3/${saveCount}.jpg`;
      },
    } as ILocalStorageService;

    const useCase = new SaveEntityMediasUseCase(
      repository,
      storage,
      { execute: async () => undefined } as DeleteMediasByEntityUseCase,
    );

    const result = await useCase.execute(ENTITY_TYPE.ROOM, 3, files);

    expect(result).toHaveLength(2);
    expect(result[0].entityType).toBe(ENTITY_TYPE.ROOM);
  });

  it('should return empty array when no files provided', async () => {
    const useCase = new SaveEntityMediasUseCase(
      {} as IMediaRepository,
      {} as ILocalStorageService,
      {} as DeleteMediasByEntityUseCase,
    );

    const result = await useCase.execute(ENTITY_TYPE.ROOM, 1, []);
    expect(result).toEqual([]);
  });

  it('should reject when exceeding entity media limit', async () => {
    const files = [
      { buffer: Buffer.from('1'), originalname: 'a.jpg', mimetype: 'image/jpeg' },
      { buffer: Buffer.from('2'), originalname: 'b.jpg', mimetype: 'image/jpeg' },
    ] as UploadFile[];

    const useCase = new SaveEntityMediasUseCase(
      {} as IMediaRepository,
      {} as ILocalStorageService,
      {} as DeleteMediasByEntityUseCase,
    );

    await expect(
      useCase.execute(ENTITY_TYPE.PROPERTY, 1, files),
    ).rejects.toThrow('Maximum 1 media file(s) allowed');
  });
});
