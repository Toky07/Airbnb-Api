import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { ICommandHandler } from '@src/shared/useCase/bus/command-handler.interface';
import { RoomRateOverride } from '@src/modules/rooms/domain/entities/room-rate-override.entity';
import type { IRoomRateOverrideRepository } from '@src/modules/rooms/domain/repositories/room-rate-override.repository';
import type { IRoomRepository } from '@src/modules/rooms/domain/repositories/room.repository';
import { RoomRateOverrideOutput } from '@src/modules/rooms/applications/dto/room-rate-override.output';
import { validateBlockedDateRange } from '@src/modules/rooms/applications/utils/validate-blocked-date-range';
import type { CreateRoomRateOverrideCommand } from '@src/modules/rooms/applications/useCase/commands/CreateRoomRateOverrideCommand';

export class CreateRoomRateOverrideCommandHandler implements ICommandHandler<
  CreateRoomRateOverrideCommand,
  RoomRateOverrideOutput
> {
  constructor(
    private readonly rateOverrideRepository: IRoomRateOverrideRepository,
    private readonly roomRepository: IRoomRepository,
  ) {}

  async execute(
    command: CreateRoomRateOverrideCommand,
  ): Promise<RoomRateOverrideOutput> {
    const room = await this.roomRepository.findById(command.roomId);
    if (!room?.id) {
      throw new NotFoundException('Chambre introuvable.');
    }

    const { startDate, endDate } = validateBlockedDateRange(
      command.dto.startDate,
      command.dto.endDate,
    );

    if (command.dto.pricePerNight <= 0) {
      throw new BadRequestException('Le prix par nuit doit être positif.');
    }

    const overlapping = await this.rateOverrideRepository.findOverlapping(
      command.roomId,
      startDate,
      endDate,
    );
    if (overlapping.length > 0) {
      throw new BadRequestException(
        'Cette plage chevauche déjà une tarification spéciale.',
      );
    }

    const label = command.dto.label?.trim() || null;
    const created = await this.rateOverrideRepository.create(
      new RoomRateOverride(
        command.roomId,
        startDate,
        endDate,
        command.dto.pricePerNight,
        label,
      ),
    );

    return RoomRateOverrideOutput.fromDomain(created);
  }
}
