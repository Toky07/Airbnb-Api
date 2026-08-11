import type { IQueryHandler } from '@src/shared/useCase/bus/query-handler.interface';
import { Media } from '@src/modules/media/domain/entities/media.entity';
import type { IMediaRepository } from '@src/modules/media/domain/repositories/media.repository';
import type { GetMediasByEntityQuery } from '@src/modules/media/applications/useCase/queries/GetMediasByEntityQuery';

export class GetMediasByEntityQueryHandler implements IQueryHandler<
  GetMediasByEntityQuery,
  Media[]
> {
  constructor(private readonly repository: IMediaRepository) {}

  async execute(query: GetMediasByEntityQuery): Promise<Media[]> {
    return this.repository.findByEntity(query.entityType, query.entityId);
  }
}
