import { ENTITY_TYPE, MEDIA_TYPE } from '../../constant';
import { Media } from '../../domain/entities/media.entity';
import type { IMediaRepository } from '../../domain/repositories/media.repository';
import { GetMediasByEntityUseCase } from './getMediasByEntity.usecase';

const repository = {
  findByEntity: async () => [
    new Media(
      'uploads/properties/1/a.jpg',
      MEDIA_TYPE.IMAGE,
      ENTITY_TYPE.PROPERTY,
      1,
      1,
    ),
  ],
} as IMediaRepository;

describe('GetMediasByEntityUseCase', () => {
  it('should return medias for an entity', async () => {
    const useCase = new GetMediasByEntityUseCase(repository);
    const result = await useCase.execute(ENTITY_TYPE.PROPERTY, 1);

    expect(result).toHaveLength(1);
    expect(result[0].path).toBe('uploads/properties/1/a.jpg');
  });
});
