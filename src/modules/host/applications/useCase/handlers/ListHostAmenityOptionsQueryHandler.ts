import type { IQueryHandler } from '@src/shared/useCase/bus/query-handler.interface';
import { QueryBus } from '@src/shared/useCase/bus/query-bus';
import { AmenityOutput } from '@src/modules/amenity/contracts';
import { ListAmenityOptionsQuery } from '@src/modules/amenity/contracts';
import type { ListHostAmenityOptionsQuery } from '@src/modules/host/applications/useCase/queries/ListHostAmenityOptionsQuery';

export class ListHostAmenityOptionsQueryHandler implements IQueryHandler<
  ListHostAmenityOptionsQuery,
  AmenityOutput[]
> {
  execute(query: ListHostAmenityOptionsQuery): Promise<AmenityOutput[]> {
    return QueryBus.execute(new ListAmenityOptionsQuery(query.scope));
  }
}
