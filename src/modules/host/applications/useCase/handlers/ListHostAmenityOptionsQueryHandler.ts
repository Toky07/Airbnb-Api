import type { IQueryHandler } from '../../../../../shared/useCase/bus/query-handler.interface';
import { QueryBus } from '../../../../../shared/useCase/bus/query-bus';
import { AmenityOutput } from '../../../../amenity/applications/dto/amenity.output';
import { ListAmenityOptionsQuery } from '../../../../amenity/applications/useCase/queries/ListAmenityOptionsQuery';
import type { ListHostAmenityOptionsQuery } from '../queries/ListHostAmenityOptionsQuery';

export class ListHostAmenityOptionsQueryHandler implements IQueryHandler<
  ListHostAmenityOptionsQuery,
  AmenityOutput[]
> {
  execute(query: ListHostAmenityOptionsQuery): Promise<AmenityOutput[]> {
    return QueryBus.execute(new ListAmenityOptionsQuery(query.scope));
  }
}
