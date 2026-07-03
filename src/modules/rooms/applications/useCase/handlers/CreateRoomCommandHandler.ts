import type { ICommandHandler } from '../../../../../shared/useCase/bus/command-handler.interface';
import { CommandBus } from '../../../../../shared/useCase/bus/bus';
import { Room } from '../../../domain/entities/room.entity';
import type { IRoomRepository } from '../../../domain/repositories/room.repository';
import { RoomOutput } from '../../dto/room.output';
import { ENTITY_TYPE } from '../../../../media/constant';
import { SaveEntityMediasCommand } from '../../../../media/applications/useCase/commands/SaveEntityMediasCommand';
import type { RoomMediaPresenter } from '../../presenters/room-media.presenter';
import type { GenerateRoomSlugService } from '../../services/generate-room-slug.service';
import type { CreateRoomCommand } from '../commands/CreateRoomCommand';

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
