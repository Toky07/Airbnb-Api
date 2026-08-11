import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { ICommandHandler } from '@src/shared/useCase/bus/command-handler.interface';
import { RoomBlockedDate } from '@src/modules/rooms/domain/entities/room-blocked-date.entity';
import type { IRoomBlockedDateRepository } from '@src/modules/rooms/domain/repositories/room-blocked-date.repository';
import type { IRoomRepository } from '@src/modules/rooms/domain/repositories/room.repository';
import { RoomBlockedDateOutput } from '@src/modules/rooms/applications/dto/room-blocked-date.output';
import { validateBlockedDateRange } from '@src/modules/rooms/applications/utils/validate-blocked-date-range';
import type { CreateRoomBlockedDateCommand } from '@src/modules/rooms/applications/useCase/commands/CreateRoomBlockedDateCommand';

export class CreateRoomBlockedDateCommandHandler implements ICommandHandler<
  CreateRoomBlockedDateCommand,
  RoomBlockedDateOutput
> {
  constructor(
    private readonly blockedDateRepository: IRoomBlockedDateRepository,
    private readonly roomRepository: IRoomRepository,
  ) {}

  async execute(
    command: CreateRoomBlockedDateCommand,
  ): Promise<RoomBlockedDateOutput> {
    const room = await this.roomRepository.findById(command.roomId);
    if (!room?.id) {
      throw new NotFoundException('Chambre introuvable.');
    }

    const { startDate, endDate } = validateBlockedDateRange(
      command.dto.startDate,
      command.dto.endDate,
    );

    const overlapping = await this.blockedDateRepository.findOverlapping(
      command.roomId,
      startDate,
      endDate,
    );
    if (overlapping.length > 0) {
      throw new BadRequestException(
        'Cette plage chevauche déjà une période bloquée.',
      );
    }

    const reason = command.dto.reason?.trim() || null;
    const created = await this.blockedDateRepository.create(
      new RoomBlockedDate(command.roomId, startDate, endDate, reason),
    );

    return RoomBlockedDateOutput.fromDomain(created);
  }
}
