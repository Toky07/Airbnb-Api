import { ENTITY_TYPE, MEDIA_TYPE } from '../../constant';
import { Media } from '../../domain/entities/media.entity';
import type { IMediaRepository } from '../../domain/repositories/media.repository';
import type { ILocalStorageService } from '../../services/localStorage.service';
import { DeleteMediasByEntityUseCase } from './deleteMediasByEntity.usecase';

describe('DeleteMediasByEntityUseCase', () => {
  it('should delete medias from repository and storage', async () => {
    const deleted: Media[] = [
      new Media(
        'uploads/properties/1/a.jpg',
        MEDIA_TYPE.IMAGE,
        ENTITY_TYPE.PROPERTY,
        1,
        1,
      ),
    ];

    const repository = {
      deleteByEntity: async () => deleted,
    } as IMediaRepository;

    const deletedPaths: string[] = [];
    const storage = {
      deleteMany: async (paths: string[]) => {
        deletedPaths.push(...paths);
      },
    } as ILocalStorageService;

    const useCase = new DeleteMediasByEntityUseCase(repository, storage);
    await useCase.execute(ENTITY_TYPE.PROPERTY, 1);

    expect(deletedPaths).toEqual(['uploads/properties/1/a.jpg']);
  });
});
