import type { IQueryHandler } from '../../../../../shared/useCase/bus/query-handler.interface';
import type { IAmenityRepository } from '../../../domain/repositories/amenity.repository';
import { AmenityOutput } from '../../dto/amenity.output';
import type { ListAmenityOptionsQuery } from '../queries/ListAmenityOptionsQuery';

export class ListAmenityOptionsQueryHandler implements IQueryHandler<
  ListAmenityOptionsQuery,
  AmenityOutput[]
> {
  constructor(private readonly repository: IAmenityRepository) {}

  async execute(query: ListAmenityOptionsQuery): Promise<AmenityOutput[]> {
    const amenities = await this.repository.findActive(query.scope);
    return amenities.map(AmenityOutput.fromDomain);
  }
}
