import type { IQueryHandler } from '../../../../../shared/useCase/bus/query-handler.interface';
import type { IAmenityRepository } from '../../../domain/repositories/amenity.repository';
import { AmenityOutput } from '../../dto/amenity.output';
import type { ListAmenitiesQuery } from '../queries/ListAmenitiesQuery';

export class ListAmenitiesQueryHandler implements IQueryHandler<
  ListAmenitiesQuery,
  AmenityOutput[]
> {
  constructor(private readonly repository: IAmenityRepository) {}

  async execute(query: ListAmenitiesQuery): Promise<AmenityOutput[]> {
    const amenities = await this.repository.findAll(query.scope);
    return amenities.map(AmenityOutput.fromDomain);
  }
}
