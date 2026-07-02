import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { JwtPayload } from '../../../authentication/domain/types/jwt-payload';
import type { PaginatedResult, PaginationParams } from '../../../../shared/pagination/pagination.types';
import { CommandBus } from '../../../../shared/useCase/bus/bus';
import { QueryBus } from '../../../../shared/useCase/bus/query-bus';
import { CreateRoomCommand } from '../../../rooms/applications/useCase/commands/CreateRoomCommand';
import { UpdateRoomCommand } from '../../../rooms/applications/useCase/commands/UpdateRoomCommand';
import { DeleteRoomCommand } from '../../../rooms/applications/useCase/commands/DeleteRoomCommand';
import { FindRoomQuery } from '../../../rooms/applications/useCase/queries/FindRoomQuery';
import { ListRoomsQuery } from '../../../rooms/applications/useCase/queries/ListRoomsQuery';
import type { CreateRoomDto } from '../../../rooms/applications/dto/createRoom.dto';
import { RoomOutput } from '../../../rooms/applications/dto/room.output';
import type { UploadFile } from '../../../media/types/upload-file';
import { ResolveHostPropertyService } from '../services/resolve-host-property.service';

@Injectable()
export class ListHostRoomsUseCase {
  constructor(
    private readonly resolveHostProperty: ResolveHostPropertyService,
  ) {}

  async execute(
    authUser: JwtPayload,
    propertyId: number,
    params: PaginationParams,
  ): Promise<PaginatedResult<RoomOutput>> {
    await this.resolveHostProperty.requireOwned(authUser, propertyId);

    return QueryBus.execute(
      new ListRoomsQuery({
        ...params,
        propertyId,
      }),
    );
  }
}

@Injectable()
export class CreateHostRoomUseCase {
  constructor(
    private readonly resolveHostProperty: ResolveHostPropertyService,
  ) {}

  async execute(
    authUser: JwtPayload,
    propertyId: number,
    dto: Omit<CreateRoomDto, 'property'>,
    images?: UploadFile[],
  ): Promise<RoomOutput> {
    const property = await this.resolveHostProperty.requireOwned(authUser, propertyId);

    return CommandBus.execute(
      new CreateRoomCommand({ ...dto, property }, images),
    );
  }
}

@Injectable()
export class UpdateHostRoomUseCase {
  constructor(
    private readonly resolveHostProperty: ResolveHostPropertyService,
  ) {}

  async execute(
    authUser: JwtPayload,
    propertyId: number,
    roomId: number,
    dto: Omit<CreateRoomDto, 'property'>,
    images?: UploadFile[],
    keptImages?: string[],
  ): Promise<RoomOutput> {
    const property = await this.resolveHostProperty.requireOwned(authUser, propertyId);
    const room = await QueryBus.execute<RoomOutput | null>(
      new FindRoomQuery({ id: roomId }),
    );

    if (!room || room.property.id !== property.id) {
      throw new ForbiddenException('Chambre introuvable ou accès refusé.');
    }

    return CommandBus.execute(
      new UpdateRoomCommand(roomId, { ...dto, property }, images, keptImages),
    );
  }
}

@Injectable()
export class DeleteHostRoomUseCase {
  constructor(
    private readonly resolveHostProperty: ResolveHostPropertyService,
  ) {}

  async execute(
    authUser: JwtPayload,
    propertyId: number,
    roomId: number,
  ): Promise<{ status: boolean }> {
    const property = await this.resolveHostProperty.requireOwned(authUser, propertyId);
    const room = await QueryBus.execute<RoomOutput | null>(
      new FindRoomQuery({ id: roomId }),
    );

    if (!room || room.property.id !== property.id) {
      throw new ForbiddenException('Chambre introuvable ou accès refusé.');
    }

    const status = await CommandBus.execute<boolean>(
      new DeleteRoomCommand(roomId),
    );
    return { status };
  }
}
