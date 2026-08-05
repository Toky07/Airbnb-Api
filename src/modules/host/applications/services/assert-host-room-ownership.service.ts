import { ForbiddenException } from '@nestjs/common';
import type { JwtPayload } from '../../../authentication/domain/types/jwt-payload';
import { QueryBus } from '../../../../shared/useCase/bus/query-bus';
import { FindRoomQuery } from '../../../rooms/applications/useCase/queries/FindRoomQuery';
import { RoomOutput } from '../../../rooms/applications/dto/room.output';
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
