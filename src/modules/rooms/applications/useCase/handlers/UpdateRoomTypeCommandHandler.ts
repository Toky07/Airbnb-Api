import { ConflictException, NotFoundException } from '@nestjs/common';
import type { ICommandHandler } from '@src/shared/useCase/bus/command-handler.interface';
import { slugify } from '@src/shared/utils/slug.util';
import { RoomType } from '@src/modules/rooms/domain/entities/room-type.entity';
import type { IRoomTypeRepository } from '@src/modules/rooms/domain/repositories/room-type.repository';
import { RoomTypeOutput } from '@src/modules/rooms/applications/dto/room-type.output';
import type { UpdateRoomTypeCommand } from '@src/modules/rooms/applications/useCase/commands/UpdateRoomTypeCommand';

export class UpdateRoomTypeCommandHandler implements ICommandHandler<
  UpdateRoomTypeCommand,
  RoomTypeOutput
> {
  constructor(private readonly repository: IRoomTypeRepository) {}

  async execute(command: UpdateRoomTypeCommand): Promise<RoomTypeOutput> {
    const current = await this.repository.findById(command.id);
    if (!current) {
      throw new NotFoundException('Type de chambre introuvable');
    }

    const name = command.dto.name?.trim() ?? current.name;
    const slug = slugify(name);
    const duplicate = await this.repository.findBySlug(slug);
    if (duplicate && duplicate.id !== command.id) {
      throw new ConflictException('Un type de chambre avec ce nom existe déjà');
    }

    const updated = await this.repository.update(
      new RoomType(
        name,
        slug,
        command.dto.sortOrder ?? current.sortOrder,
        command.dto.isActive ?? current.isActive,
        current.id,
        current.createdAt,
        current.updatedAt,
      ),
    );

    return RoomTypeOutput.fromDomain(updated);
  }
}
