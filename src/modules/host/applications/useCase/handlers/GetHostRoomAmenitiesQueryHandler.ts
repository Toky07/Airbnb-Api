import { ForbiddenException } from '@nestjs/common';
import type { IQueryHandler } from '../../../../../shared/useCase/bus/query-handler.interface';
import { QueryBus } from '../../../../../shared/useCase/bus/query-bus';
import { AmenityOutput } from '../../../../amenity/applications/dto/amenity.output';
import { ListRoomAmenitiesQuery } from '../../../../amenity/applications/useCase/queries/ListRoomAmenitiesQuery';
import { FindRoomQuery } from '../../../../rooms/applications/useCase/queries/FindRoomQuery';
import { RoomOutput } from '../../../../rooms/applications/dto/room.output';
import { ResolveHostPropertyService } from '../../services/resolve-host-property.service';
import type { GetHostRoomAmenitiesQuery } from '../queries/GetHostRoomAmenitiesQuery';

export class GetHostRoomAmenitiesQueryHandler implements IQueryHandler<
  GetHostRoomAmenitiesQuery,
  AmenityOutput[]
> {
  constructor(
    private readonly resolveHostProperty: ResolveHostPropertyService,
  ) {}

  async execute(query: GetHostRoomAmenitiesQuery): Promise<AmenityOutput[]> {
    const property = await this.resolveHostProperty.requireOwned(
      query.authUser,
      query.propertyId,
    );
    const room = await QueryBus.execute<RoomOutput | null>(
      new FindRoomQuery({ id: query.roomId }),
    );

    if (!room || room.property.id !== property.id) {
      throw new ForbiddenException('Chambre introuvable ou accès refusé.');
    }

    return QueryBus.execute(new ListRoomAmenitiesQuery(query.roomId));
  }
}
