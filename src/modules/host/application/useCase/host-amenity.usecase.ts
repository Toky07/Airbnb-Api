import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { JwtPayload } from '../../../authentication/domain/types/jwt-payload';
import type { AmenityScope } from '../../../amenity/domain/constants/amenity-scope.constant';
import type { SyncAmenitiesDto } from '../../../amenity/applications/dto/create-amenity.dto';
import { AmenityOutput } from '../../../amenity/applications/dto/amenity.output';
import { ListAmenityOptionsUseCase } from '../../../amenity/applications/useCase/list-amenity-options.usecase';
import { ListPropertyAmenitiesUseCase } from '../../../amenity/applications/useCase/list-property-amenities.usecase';
import { ListRoomAmenitiesUseCase } from '../../../amenity/applications/useCase/list-room-amenities.usecase';
import { SyncPropertyAmenitiesUseCase } from '../../../amenity/applications/useCase/sync-property-amenities.usecase';
import { SyncRoomAmenitiesUseCase } from '../../../amenity/applications/useCase/sync-room-amenities.usecase';
import { FindOneRoomUseCase } from '../../../rooms/applications/useCase/findOneRoom.usecase';
import { ResolveHostPropertyService } from '../services/resolve-host-property.service';

@Injectable()
export class HostListAmenityOptionsUseCase {
  constructor(private readonly listAmenityOptionsUseCase: ListAmenityOptionsUseCase) {}

  execute(scope: AmenityScope): Promise<AmenityOutput[]> {
    return this.listAmenityOptionsUseCase.execute(scope);
  }
}

@Injectable()
export class HostGetPropertyAmenitiesUseCase {
  constructor(
    private readonly resolveHostProperty: ResolveHostPropertyService,
    private readonly listPropertyAmenitiesUseCase: ListPropertyAmenitiesUseCase,
  ) {}

  async execute(authUser: JwtPayload, propertyId: number): Promise<AmenityOutput[]> {
    await this.resolveHostProperty.requireOwned(authUser, propertyId);
    return this.listPropertyAmenitiesUseCase.execute(propertyId);
  }
}

@Injectable()
export class HostSyncPropertyAmenitiesUseCase {
  constructor(
    private readonly resolveHostProperty: ResolveHostPropertyService,
    private readonly syncPropertyAmenitiesUseCase: SyncPropertyAmenitiesUseCase,
  ) {}

  async execute(
    authUser: JwtPayload,
    propertyId: number,
    dto: SyncAmenitiesDto,
  ): Promise<AmenityOutput[]> {
    await this.resolveHostProperty.requireOwned(authUser, propertyId);
    return this.syncPropertyAmenitiesUseCase.execute(propertyId, dto);
  }
}

@Injectable()
export class HostGetRoomAmenitiesUseCase {
  constructor(
    private readonly resolveHostProperty: ResolveHostPropertyService,
    private readonly findOneRoomUseCase: FindOneRoomUseCase,
    private readonly listRoomAmenitiesUseCase: ListRoomAmenitiesUseCase,
  ) {}

  async execute(
    authUser: JwtPayload,
    propertyId: number,
    roomId: number,
  ): Promise<AmenityOutput[]> {
    const property = await this.resolveHostProperty.requireOwned(authUser, propertyId);
    const room = await this.findOneRoomUseCase.execute(roomId);

    if (!room || room.property.id !== property.id) {
      throw new ForbiddenException('Chambre introuvable ou accès refusé.');
    }

    return this.listRoomAmenitiesUseCase.execute(roomId);
  }
}

@Injectable()
export class HostSyncRoomAmenitiesUseCase {
  constructor(
    private readonly resolveHostProperty: ResolveHostPropertyService,
    private readonly findOneRoomUseCase: FindOneRoomUseCase,
    private readonly syncRoomAmenitiesUseCase: SyncRoomAmenitiesUseCase,
  ) {}

  async execute(
    authUser: JwtPayload,
    propertyId: number,
    roomId: number,
    dto: SyncAmenitiesDto,
  ): Promise<AmenityOutput[]> {
    await this.assertRoomOwnership(authUser, propertyId, roomId);
    return this.syncRoomAmenitiesUseCase.execute(roomId, dto);
  }

  private async assertRoomOwnership(
    authUser: JwtPayload,
    propertyId: number,
    roomId: number,
  ) {
    const property = await this.resolveHostProperty.requireOwned(authUser, propertyId);
    const room = await this.findOneRoomUseCase.execute(roomId);

    if (!room || room.property.id !== property.id) {
      throw new ForbiddenException('Chambre introuvable ou accès refusé.');
    }
  }
}
