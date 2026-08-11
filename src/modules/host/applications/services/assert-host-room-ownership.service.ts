import { ForbiddenException } from '@nestjs/common';
import type { JwtPayload } from '@src/modules/authentication/contracts';
import { QueryBus } from '@src/shared/useCase/bus/query-bus';
import { FindRoomQuery } from '@src/modules/rooms/contracts';
import { RoomOutput } from '@src/modules/rooms/contracts';
import { ResolveHostPropertyService } from './resolve-host-property.service';

export class AssertHostRoomOwnershipService {
  constructor(
    private readonly resolveHostProperty: ResolveHostPropertyService,
  ) {}

  async assert(authUser: JwtPayload, propertyId: number, roomId: number) {
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
