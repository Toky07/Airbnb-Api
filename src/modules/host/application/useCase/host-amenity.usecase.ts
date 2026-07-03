import { ForbiddenException, Injectable } from '@nestjs/common';
import type { JwtPayload } from '../../../authentication/domain/types/jwt-payload';
import type { AmenityScope } from '../../../amenity/domain/constants/amenity-scope.constant';
import type { SyncAmenitiesDto } from '../../../amenity/applications/dto/create-amenity.dto';
import { AmenityOutput } from '../../../amenity/applications/dto/amenity.output';
import { CommandBus } from '../../../../shared/useCase/bus/bus';
import { QueryBus } from '../../../../shared/useCase/bus/query-bus';
import { ListAmenityOptionsQuery } from '../../../amenity/applications/useCase/queries/ListAmenityOptionsQuery';
import { ListPropertyAmenitiesQuery } from '../../../amenity/applications/useCase/queries/ListPropertyAmenitiesQuery';
import { ListRoomAmenitiesQuery } from '../../../amenity/applications/useCase/queries/ListRoomAmenitiesQuery';
import { SyncPropertyAmenitiesCommand } from '../../../amenity/applications/useCase/commands/SyncPropertyAmenitiesCommand';
import { SyncRoomAmenitiesCommand } from '../../../amenity/applications/useCase/commands/SyncRoomAmenitiesCommand';
import { FindRoomQuery } from '../../../rooms/applications/useCase/queries/FindRoomQuery';
import { RoomOutput } from '../../../rooms/applications/dto/room.output';
import { ResolveHostPropertyService } from '../services/resolve-host-property.service';

@Injectable()
export class HostListAmenityOptionsUseCase {
  execute(scope: AmenityScope): Promise<AmenityOutput[]> {
    return QueryBus.execute(new ListAmenityOptionsQuery(scope));
  }
}

@Injectable()
export class HostGetPropertyAmenitiesUseCase {
  constructor(
    private readonly resolveHostProperty: ResolveHostPropertyService,
  ) {}

  async execute(
    authUser: JwtPayload,
    propertyId: number,
  ): Promise<AmenityOutput[]> {
    await this.resolveHostProperty.requireOwned(authUser, propertyId);
    return QueryBus.execute(new ListPropertyAmenitiesQuery(propertyId));
  }
}

@Injectable()
export class HostSyncPropertyAmenitiesUseCase {
  constructor(
    private readonly resolveHostProperty: ResolveHostPropertyService,
  ) {}

  async execute(
    authUser: JwtPayload,
    propertyId: number,
    dto: SyncAmenitiesDto,
  ): Promise<AmenityOutput[]> {
    await this.resolveHostProperty.requireOwned(authUser, propertyId);
    return CommandBus.execute(
      new SyncPropertyAmenitiesCommand(propertyId, dto),
    );
  }
}

@Injectable()
export class HostGetRoomAmenitiesUseCase {
  constructor(
    private readonly resolveHostProperty: ResolveHostPropertyService,
  ) {}

  async execute(
    authUser: JwtPayload,
    propertyId: number,
    roomId: number,
  ): Promise<AmenityOutput[]> {
    const property = await this.resolveHostProperty.requireOwned(
      authUser,
      propertyId,
    );
    const room = await QueryBus.execute<RoomOutput | null>(
      new FindRoomQuery({ id: roomId }),
    );

    if (!room || room.property.id !== property.id) {
      throw new ForbiddenException('Chambre introuvable ou accès refusé.');
    }

    return QueryBus.execute(new ListRoomAmenitiesQuery(roomId));
  }
}

@Injectable()
export class HostSyncRoomAmenitiesUseCase {
  constructor(
    private readonly resolveHostProperty: ResolveHostPropertyService,
  ) {}

  async execute(
    authUser: JwtPayload,
    propertyId: number,
    roomId: number,
    dto: SyncAmenitiesDto,
  ): Promise<AmenityOutput[]> {
    await this.assertRoomOwnership(authUser, propertyId, roomId);
    return CommandBus.execute(new SyncRoomAmenitiesCommand(roomId, dto));
  }

  private async assertRoomOwnership(
    authUser: JwtPayload,
    propertyId: number,
    roomId: number,
  ) {
    const property = await this.resolveHostProperty.requireOwned(
      authUser,
      propertyId,
    );
    const room = await QueryBus.execute<RoomOutput | null>(
      new FindRoomQuery({ id: roomId }),
    );

    if (!room || room.property.id !== property.id) {
      throw new ForbiddenException('Chambre introuvable ou accès refusé.');
    }
  }
}
