import { Inject, Injectable } from '@nestjs/common';
import { slugify } from '../../../../shared/utils/slug.util';
import {
  ROOM_REPOSITORY,
  type IRoomRepository,
} from '../../domain/repositories/room.repository';

@Injectable()
export class GenerateRoomSlugService {
  constructor(
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
  ) {}

  async execute(name: string, excludeId?: number): Promise<string> {
    const base = slugify(name);
    let candidate = base;
    let suffix = 1;

    while (true) {
      const existing = await this.roomRepository.findBySlug(candidate);

      if (!existing || existing.id === excludeId) {
        return candidate;
      }

      suffix++;
      candidate = `${base}-${suffix}`;
    }
  }
}
