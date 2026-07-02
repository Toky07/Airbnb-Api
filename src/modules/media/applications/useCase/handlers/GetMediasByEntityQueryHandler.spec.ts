import { describe, expect, it } from 'vitest';
import { ENTITY_TYPE } from '../../../constant';
import { Media } from '../../../domain/entities/media.entity';
import type { IMediaRepository } from '../../../domain/repositories/media.repository';
import { GetMediasByEntityQueryHandler } from './GetMediasByEntityQueryHandler';
import { GetMediasByEntityQuery } from '../queries/GetMediasByEntityQuery';

describe('GetMediasByEntityQueryHandler', () => {
  it('should return medias for entity', async () => {
    const repository = {
      findByEntity: async () => [
        new Media(
          'uploads/1/property/a.jpg',
          'image',
          ENTITY_TYPE.PROPERTY,
          1,
          1,
        ),
      ],
    } as IMediaRepository;

    const handler = new GetMediasByEntityQueryHandler(repository);
    const result = await handler.execute(
      new GetMediasByEntityQuery(ENTITY_TYPE.PROPERTY, 1),
    );

    expect(result[0].path).toBe('uploads/1/property/a.jpg');
  });
});
