import type { ICommandHandler } from '@src/shared/useCase/bus/command-handler.interface';
import { CommandBus } from '@src/shared/useCase/bus/bus';
import { Room } from '@src/modules/rooms/domain/entities/room.entity';
import type { IRoomRepository } from '@src/modules/rooms/domain/repositories/room.repository';
import { RoomOutput } from '@src/modules/rooms/applications/dto/room.output';
import { ENTITY_TYPE } from '@src/modules/media/contracts';
import { SaveEntityMediasCommand } from '@src/modules/media/contracts';
import type { RoomMediaPresenter } from '@src/modules/rooms/applications/presenters/room-media.presenter';
import type { GenerateRoomSlugService } from '@src/modules/rooms/applications/services/generate-room-slug.service';
import type { CreateRoomCommand } from '@src/modules/rooms/applications/useCase/commands/CreateRoomCommand';

export class CreateRoomCommandHandler implements ICommandHandler<
  CreateRoomCommand,
  RoomOutput
> {
  constructor(
    private readonly repository: IRoomRepository,
    private readonly presenter: RoomMediaPresenter,
    private readonly generateSlug: GenerateRoomSlugService,
  ) {}

  async execute(command: CreateRoomCommand): Promise<RoomOutput> {
    const room = new Room(command.dto);
    room.slug = await this.generateSlug.execute(room.name);

    const createdRoom = await this.repository.create(room);

    if (command.images?.length) {
      await CommandBus.execute(
        new SaveEntityMediasCommand(
          ENTITY_TYPE.ROOM,
          createdRoom.id!,
          command.images,
          undefined,
          command.dto.property.id,
        ),
      );
    }

    return this.presenter.toOutput(createdRoom);
  }
}
