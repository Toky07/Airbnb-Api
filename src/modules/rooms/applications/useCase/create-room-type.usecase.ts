import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { slugify } from '../../../../shared/utils/slug.util';
import { RoomType } from '../../domain/entities/room-type.entity';
import {
  ROOM_TYPE_REPOSITORY,
  type IRoomTypeRepository,
} from '../../domain/repositories/room-type.repository';
import type { CreateRoomTypeDto } from '../dto/create-room-type.dto';
import { RoomTypeOutput } from '../dto/room-type.output';

@Injectable()
export class CreateRoomTypeUseCase {
  constructor(
    @Inject(ROOM_TYPE_REPOSITORY)
    private readonly repository: IRoomTypeRepository,
  ) {}

  async execute(dto: CreateRoomTypeDto): Promise<RoomTypeOutput> {
    const name = dto.name?.trim();
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
        dto.sortOrder ?? 0,
        dto.isActive ?? true,
      ),
    );

    return RoomTypeOutput.fromDomain(created);
  }
}
