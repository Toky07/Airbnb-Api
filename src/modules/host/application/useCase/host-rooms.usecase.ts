import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { JwtPayload } from '../../../authentication/domain/types/jwt-payload';
import type { PaginatedResult, PaginationParams } from '../../../../shared/pagination/pagination.types';
import { ListRoomsUseCase } from '../../../rooms/applications/useCase/listRoom.usecase';
import { CreateRoomUseCase } from '../../../rooms/applications/useCase/createRoom.usecase';
import { UpdateRoomUseCase } from '../../../rooms/applications/useCase/updateRoom.usecase';
import { DeleteRoomUseCase } from '../../../rooms/applications/useCase/deleteRoom.usecase';
import { FindOneRoomUseCase } from '../../../rooms/applications/useCase/findOneRoom.usecase';
import type { CreateRoomDto } from '../../../rooms/applications/dto/createRoom.dto';
import { RoomOutput } from '../../../rooms/applications/dto/room.output';
import type { UploadFile } from '../../../media/types/upload-file';
import { ResolveHostPropertyService } from '../services/resolve-host-property.service';

@Injectable()
export class ListHostRoomsUseCase {
  constructor(
    private readonly resolveHostProperty: ResolveHostPropertyService,
    private readonly listRoomsUseCase: ListRoomsUseCase,
  ) {}

  async execute(
    authUser: JwtPayload,
    propertyId: number,
    params: PaginationParams,
  ): Promise<PaginatedResult<RoomOutput>> {
    await this.resolveHostProperty.requireOwned(authUser, propertyId);

    return this.listRoomsUseCase.execute({
      ...params,
      propertyId,
    });
  }
}

@Injectable()
export class CreateHostRoomUseCase {
  constructor(
    private readonly resolveHostProperty: ResolveHostPropertyService,
    private readonly createRoomUseCase: CreateRoomUseCase,
  ) {}

  async execute(
    authUser: JwtPayload,
    propertyId: number,
    dto: Omit<CreateRoomDto, 'property'>,
    images?: UploadFile[],
  ): Promise<RoomOutput> {
    const property = await this.resolveHostProperty.requireOwned(authUser, propertyId);

    return this.createRoomUseCase.execute(
      { ...dto, property },
      images,
    );
  }
}

@Injectable()
export class UpdateHostRoomUseCase {
  constructor(
    private readonly resolveHostProperty: ResolveHostPropertyService,
    private readonly findOneRoomUseCase: FindOneRoomUseCase,
    private readonly updateRoomUseCase: UpdateRoomUseCase,
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
    const room = await this.findOneRoomUseCase.execute(roomId);

    if (!room || room.property.id !== property.id) {
      throw new ForbiddenException('Chambre introuvable ou accès refusé.');
    }

    return this.updateRoomUseCase.execute(
      roomId,
      { ...dto, property },
      images,
      keptImages,
    );
  }
}

@Injectable()
export class DeleteHostRoomUseCase {
  constructor(
    private readonly resolveHostProperty: ResolveHostPropertyService,
    private readonly findOneRoomUseCase: FindOneRoomUseCase,
    private readonly deleteRoomUseCase: DeleteRoomUseCase,
  ) {}

  async execute(
    authUser: JwtPayload,
    propertyId: number,
    roomId: number,
  ): Promise<{ status: boolean }> {
    const property = await this.resolveHostProperty.requireOwned(authUser, propertyId);
    const room = await this.findOneRoomUseCase.execute(roomId);

    if (!room || room.property.id !== property.id) {
      throw new ForbiddenException('Chambre introuvable ou accès refusé.');
    }

    const status = await this.deleteRoomUseCase.execute(roomId);
    return { status };
  }
}
