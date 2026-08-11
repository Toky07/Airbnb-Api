import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { slugify } from '@src/shared/utils/slug.util';
import { RoomEntity } from '@src/modules/rooms/infrastructure/entities/room.entity';

@Injectable()
export class RoomSlugsSeedService implements OnModuleInit {
  constructor(
    @InjectRepository(RoomEntity)
    private readonly repository: Repository<RoomEntity>,
  ) {}

  async onModuleInit(): Promise<void> {
    const rooms = await this.repository.find({
      where: [{ slug: IsNull() }, { slug: '' }],
    });

    for (const room of rooms) {
      const base = slugify(room.name);
      let candidate = base;
      let suffix = 1;

      while (true) {
        const conflict = await this.repository.findOne({
          where: { slug: candidate },
        });

        if (!conflict || conflict.id === room.id) {
          break;
        }

        suffix++;
        candidate = `${base}-${suffix}`;
      }

      room.slug = candidate;
      await this.repository.save(room);
    }
  }
}
