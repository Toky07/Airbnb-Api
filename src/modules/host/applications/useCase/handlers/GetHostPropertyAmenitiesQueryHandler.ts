import type { IQueryHandler } from '../../../../../shared/useCase/bus/query-handler.interface';
import { QueryBus } from '../../../../../shared/useCase/bus/query-bus';
import { AmenityOutput } from '../../../../amenity/contracts';
import { ListPropertyAmenitiesQuery } from '../../../../amenity/contracts';
import { ResolveHostPropertyService } from '../../services/resolve-host-property.service';
import type { GetHostPropertyAmenitiesQuery } from '../queries/GetHostPropertyAmenitiesQuery';

export class GetHostPropertyAmenitiesQueryHandler implements IQueryHandler<
  GetHostPropertyAmenitiesQuery,
  AmenityOutput[]
> {
  constructor(
    private readonly resolveHostProperty: ResolveHostPropertyService,
  ) {}

  async execute(
    query: GetHostPropertyAmenitiesQuery,
  ): Promise<AmenityOutput[]> {
    await this.resolveHostProperty.requireOwned(
      query.authUser,
      query.propertyId,
    );
    return QueryBus.execute(new ListPropertyAmenitiesQuery(query.propertyId));
  }
}
