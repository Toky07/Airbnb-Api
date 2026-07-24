import { NotFoundException } from '@nestjs/common';
import type { ICommandHandler } from '../../../../../shared/useCase/bus/command-handler.interface';
import type { IRoomRateOverrideRepository } from '../../../domain/repositories/room-rate-override.repository';
import type { DeleteRoomRateOverrideCommand } from '../commands/DeleteRoomRateOverrideCommand';

export class DeleteRoomRateOverrideCommandHandler implements ICommandHandler<
  DeleteRoomRateOverrideCommand,
  void
> {
  constructor(
    private readonly rateOverrideRepository: IRoomRateOverrideRepository,
  ) {}

  async execute(command: DeleteRoomRateOverrideCommand): Promise<void> {
    const existing = await this.rateOverrideRepository.findById(
      command.rateOverrideId,
    );
    if (!existing || existing.roomId !== command.roomId) {
      throw new NotFoundException('Tarif spécial introuvable.');
    }

    await this.rateOverrideRepository.delete(command.rateOverrideId);
  }
}
