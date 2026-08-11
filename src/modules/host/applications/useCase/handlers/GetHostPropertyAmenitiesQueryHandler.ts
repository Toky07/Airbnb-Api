import type { IQueryHandler } from '@src/shared/useCase/bus/query-handler.interface';
import { QueryBus } from '@src/shared/useCase/bus/query-bus';
import { AmenityOutput } from '@src/modules/amenity/contracts';
import { ListPropertyAmenitiesQuery } from '@src/modules/amenity/contracts';
import { ResolveHostPropertyService } from '@src/modules/host/applications/services/resolve-host-property.service';
import type { GetHostPropertyAmenitiesQuery } from '@src/modules/host/applications/useCase/queries/GetHostPropertyAmenitiesQuery';

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
