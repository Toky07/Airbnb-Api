import type { ICommandHandler } from '@src/shared/useCase/bus/command-handler.interface';
import { CommandBus } from '@src/shared/useCase/bus/bus';
import type { IRoomRepository } from '@src/modules/rooms/domain/repositories/room.repository';
import { RoomOutput } from '@src/modules/rooms/applications/dto/room.output';
import { ENTITY_TYPE } from '@src/modules/media/contracts';
import { SyncEntityMediasCommand } from '@src/modules/media/contracts';
import type { RoomMediaPresenter } from '@src/modules/rooms/applications/presenters/room-media.presenter';
import type { GenerateRoomSlugService } from '@src/modules/rooms/applications/services/generate-room-slug.service';
import type { UpdateRoomCommand } from '@src/modules/rooms/applications/useCase/commands/UpdateRoomCommand';

export class UpdateRoomCommandHandler implements ICommandHandler<
  UpdateRoomCommand,
  RoomOutput
> {
  constructor(
    private readonly repository: IRoomRepository,
    private readonly presenter: RoomMediaPresenter,
    private readonly generateSlug: GenerateRoomSlugService,
  ) {}

  async execute(command: UpdateRoomCommand): Promise<RoomOutput> {
    const room = await this.repository.findById(command.id);

    if (!room) {
      throw new Error('Room not found');
    }

    const nameChanged = room.name !== command.dto.name;
    room.name = command.dto.name;
    if (nameChanged || !room.slug) {
      room.slug = await this.generateSlug.execute(room.name, room.id);
    }
    room.description = command.dto.description;
    room.pricePerNight = command.dto.pricePerNight;
    room.weekendPricePerNight = command.dto.weekendPricePerNight ?? null;
    room.maxGuests = command.dto.maxGuests;
    room.bedrooms = command.dto.bedrooms;
    room.bathrooms = command.dto.bathrooms;
    room.beds = command.dto.beds;
    room.quantity = command.dto.quantity;
    room.size = command.dto.size;
    room.status = command.dto.status;
    room.property = command.dto.property;
    room.roomTypeId = command.dto.roomTypeId ?? null;
    room.roomType = null;

    const updatedRoom = await this.repository.update(room);

    if (command.keptImagePaths !== undefined || command.images?.length) {
      const propertyId =
        updatedRoom.property?.id ?? command.dto.property.id ?? undefined;

      await CommandBus.execute(
        new SyncEntityMediasCommand(
          ENTITY_TYPE.ROOM,
          updatedRoom.id!,
          {
            keptPaths: command.keptImagePaths ?? [],
            newFiles: command.images,
          },
          undefined,
          propertyId,
        ),
      );
    }

    return this.presenter.toOutput(updatedRoom);
  }
}
