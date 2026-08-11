import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { ICommandHandler } from '@src/shared/useCase/bus/command-handler.interface';
import type { IRoomTypeRepository } from '@src/modules/rooms/domain/repositories/room-type.repository';
import type { DeleteRoomTypeCommand } from '@src/modules/rooms/applications/useCase/commands/DeleteRoomTypeCommand';

export class DeleteRoomTypeCommandHandler implements ICommandHandler<
  DeleteRoomTypeCommand,
  boolean
> {
  constructor(private readonly repository: IRoomTypeRepository) {}

  async execute(command: DeleteRoomTypeCommand): Promise<boolean> {
    const current = await this.repository.findById(command.id);
    if (!current) {
      throw new NotFoundException('Type de chambre introuvable');
    }

    const usages = await this.repository.countUsages(command.id);
    if (usages > 0) {
      throw new BadRequestException(
        'Impossible de supprimer : des chambres utilisent ce type',
      );
    }

    return this.repository.delete(command.id);
  }
}
