import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { slugify } from '../../../../shared/utils/slug.util';
import { RoomTypeEntity } from '../entities/room-type.entity';

const DEFAULT_ROOM_TYPES = [
  'Standard',
  'Deluxe',
  'Superior',
  'Executive',
  'Junior Suite',
  'Suite',
  'Presidential Suite',
];

@Injectable()
export class RoomTypesSeedService implements OnModuleInit {
  constructor(
    @InjectRepository(RoomTypeEntity)
    private readonly repository: Repository<RoomTypeEntity>,
  ) {}

  async onModuleInit(): Promise<void> {
    const existingCount = await this.repository.count();
    if (existingCount === 0) {
      await this.repository.insert(
        DEFAULT_ROOM_TYPES.map((name, index) => ({
          name,
          slug: slugify(name),
          sortOrder: index,
          isActive: true,
        })),
      );
      return;
    }

    for (const [index, name] of DEFAULT_ROOM_TYPES.entries()) {
      const slug = slugify(name);
      const existing = await this.repository.findOne({ where: { slug } });
      if (!existing) {
        await this.repository.save(
          this.repository.create({
            name,
            slug,
            sortOrder: index,
            isActive: true,
          }),
        );
      }
    }
  }
}
