import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { slugify } from '../../../../shared/utils/slug.util';
import { RoomType } from '../../domain/entities/room-type.entity';
import {
  ROOM_TYPE_REPOSITORY,
  type IRoomTypeRepository,
} from '../../domain/repositories/room-type.repository';
import type { UpdateRoomTypeDto } from '../dto/create-room-type.dto';
import { RoomTypeOutput } from '../dto/room-type.output';

@Injectable()
export class UpdateRoomTypeUseCase {
  constructor(
    @Inject(ROOM_TYPE_REPOSITORY)
    private readonly repository: IRoomTypeRepository,
  ) {}

  async execute(id: number, dto: UpdateRoomTypeDto): Promise<RoomTypeOutput> {
    const current = await this.repository.findById(id);
    if (!current) {
      throw new NotFoundException('Type de chambre introuvable');
    }

    const name = dto.name?.trim() ?? current.name;
    const slug = slugify(name);
    const duplicate = await this.repository.findBySlug(slug);
    if (duplicate && duplicate.id !== id) {
      throw new ConflictException('Un type de chambre avec ce nom existe déjà');
    }

    const updated = await this.repository.update(
      new RoomType(
        name,
        slug,
        dto.sortOrder ?? current.sortOrder,
        dto.isActive ?? current.isActive,
        current.id,
        current.createdAt,
        current.updatedAt,
      ),
    );

    return RoomTypeOutput.fromDomain(updated);
  }
}
