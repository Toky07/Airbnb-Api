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
import { PROPERTY_REPOSITORY } from '../../../properties/infrastructure/repositories/property.repository';
import type { IPropertyRepository } from '../../../properties/domain/repositories/property.repository';
import type { UploadFile } from '../../../media/types/upload-file';
import { ResolveHostUserService } from '../services/resolve-host-user.service';

@Injectable()
export class ListHostRoomsUseCase {
  constructor(
    private readonly resolveHostUser: ResolveHostUserService,
    @Inject(PROPERTY_REPOSITORY)
    private readonly propertyRepository: IPropertyRepository,
    private readonly listRoomsUseCase: ListRoomsUseCase,
  ) {}

  async execute(
    authUser: JwtPayload,
    params: PaginationParams,
  ): Promise<PaginatedResult<RoomOutput>> {
    const user = await this.resolveHostUser.resolve(authUser.sub);
    const property = await this.propertyRepository.findByOwnerId(user.id!);

    if (!property?.id) {
      return {
        data: [],
        meta: { page: 1, limit: params.limit, total: 0, totalPages: 0 },
      };
    }

    return this.listRoomsUseCase.execute({
      ...params,
      propertyId: property.id,
    });
  }
}

@Injectable()
export class CreateHostRoomUseCase {
  constructor(
    private readonly resolveHostUser: ResolveHostUserService,
    @Inject(PROPERTY_REPOSITORY)
    private readonly propertyRepository: IPropertyRepository,
    private readonly createRoomUseCase: CreateRoomUseCase,
  ) {}

  async execute(
    authUser: JwtPayload,
    dto: Omit<CreateRoomDto, 'property'>,
    images?: UploadFile[],
  ): Promise<RoomOutput> {
    const user = await this.resolveHostUser.resolve(authUser.sub);
    const property = await this.propertyRepository.findByOwnerId(user.id!);

    if (!property?.id) {
      throw new NotFoundException('Créez d\'abord votre établissement.');
    }

    return this.createRoomUseCase.execute(
      { ...dto, property },
      images,
    );
  }
}

@Injectable()
export class UpdateHostRoomUseCase {
  constructor(
    private readonly resolveHostUser: ResolveHostUserService,
    @Inject(PROPERTY_REPOSITORY)
    private readonly propertyRepository: IPropertyRepository,
    private readonly findOneRoomUseCase: FindOneRoomUseCase,
    private readonly updateRoomUseCase: UpdateRoomUseCase,
  ) {}

  async execute(
    authUser: JwtPayload,
    roomId: number,
    dto: Omit<CreateRoomDto, 'property'>,
    images?: UploadFile[],
    keptImages?: string[],
  ): Promise<RoomOutput> {
    const user = await this.resolveHostUser.resolve(authUser.sub);
    const property = await this.propertyRepository.findByOwnerId(user.id!);

    if (!property?.id) {
      throw new NotFoundException('Établissement introuvable.');
    }

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
    private readonly resolveHostUser: ResolveHostUserService,
    @Inject(PROPERTY_REPOSITORY)
    private readonly propertyRepository: IPropertyRepository,
    private readonly findOneRoomUseCase: FindOneRoomUseCase,
    private readonly deleteRoomUseCase: DeleteRoomUseCase,
  ) {}

  async execute(authUser: JwtPayload, roomId: number): Promise<{ status: boolean }> {
    const user = await this.resolveHostUser.resolve(authUser.sub);
    const property = await this.propertyRepository.findByOwnerId(user.id!);

    if (!property?.id) {
      throw new NotFoundException('Établissement introuvable.');
    }

    const room = await this.findOneRoomUseCase.execute(roomId);
    if (!room || room.property.id !== property.id) {
      throw new ForbiddenException('Chambre introuvable ou accès refusé.');
    }

    const status = await this.deleteRoomUseCase.execute(roomId);
    return { status };
  }
}
