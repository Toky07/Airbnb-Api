import type { IQueryHandler } from '../../../../../shared/useCase/bus/query-handler.interface';
import { Media } from '../../../domain/entities/media.entity';
import type { IMediaRepository } from '../../../domain/repositories/media.repository';
import type { GetMediasByEntityQuery } from '../queries/GetMediasByEntityQuery';

export class GetMediasByEntityQueryHandler implements IQueryHandler<
  GetMediasByEntityQuery,
  Media[]
> {
  constructor(private readonly repository: IMediaRepository) {}

  async execute(query: GetMediasByEntityQuery): Promise<Media[]> {
    return this.repository.findByEntity(query.entityType, query.entityId);
  }
}
