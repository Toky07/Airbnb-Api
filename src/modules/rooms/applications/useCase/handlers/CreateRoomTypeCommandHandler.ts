import { ConflictException } from '@nestjs/common';
import type { ICommandHandler } from '@src/shared/useCase/bus/command-handler.interface';
import { slugify } from '@src/shared/utils/slug.util';
import { RoomType } from '@src/modules/rooms/domain/entities/room-type.entity';
import type { IRoomTypeRepository } from '@src/modules/rooms/domain/repositories/room-type.repository';
import { RoomTypeOutput } from '@src/modules/rooms/applications/dto/room-type.output';
import type { CreateRoomTypeCommand } from '@src/modules/rooms/applications/useCase/commands/CreateRoomTypeCommand';

export class CreateRoomTypeCommandHandler implements ICommandHandler<
  CreateRoomTypeCommand,
  RoomTypeOutput
> {
  constructor(private readonly repository: IRoomTypeRepository) {}

  async execute(command: CreateRoomTypeCommand): Promise<RoomTypeOutput> {
    const name = command.dto.name?.trim();
    if (!name) {
      throw new ConflictException('Le nom est requis');
    }

    const slug = slugify(name);
    const existing = await this.repository.findBySlug(slug);
    if (existing) {
      throw new ConflictException('Un type de chambre avec ce nom existe déjà');
    }

    const created = await this.repository.create(
      new RoomType(
        name,
        slug,
        command.dto.sortOrder ?? 0,
        command.dto.isActive ?? true,
      ),
    );

    return RoomTypeOutput.fromDomain(created);
  }
}
