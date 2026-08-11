import { NotFoundException } from '@nestjs/common';
import type { ICommandHandler } from '@src/shared/useCase/bus/command-handler.interface';
import type { IRoomBlockedDateRepository } from '@src/modules/rooms/domain/repositories/room-blocked-date.repository';
import type { DeleteRoomBlockedDateCommand } from '@src/modules/rooms/applications/useCase/commands/DeleteRoomBlockedDateCommand';

export class DeleteRoomBlockedDateCommandHandler implements ICommandHandler<
  DeleteRoomBlockedDateCommand,
  { status: boolean }
> {
  constructor(
    private readonly blockedDateRepository: IRoomBlockedDateRepository,
  ) {}

  async execute(
    command: DeleteRoomBlockedDateCommand,
  ): Promise<{ status: boolean }> {
    const existing = await this.blockedDateRepository.findById(
      command.blockedDateId,
    );

    if (!existing || existing.roomId !== command.roomId) {
      throw new NotFoundException('Période bloquée introuvable.');
    }

    await this.blockedDateRepository.delete(command.blockedDateId);
    return { status: true };
  }
}
