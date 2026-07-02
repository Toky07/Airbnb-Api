import {
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import type { ICommandHandler } from '../../../../../shared/useCase/bus/command-handler.interface';
import { slugify } from '../../../../../shared/utils/slug.util';
import { RoomType } from '../../../domain/entities/room-type.entity';
import type { IRoomTypeRepository } from '../../../domain/repositories/room-type.repository';
import { RoomTypeOutput } from '../../dto/room-type.output';
import type { UpdateRoomTypeCommand } from '../commands/UpdateRoomTypeCommand';

export class UpdateRoomTypeCommandHandler
  implements ICommandHandler<UpdateRoomTypeCommand, RoomTypeOutput>
{
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
