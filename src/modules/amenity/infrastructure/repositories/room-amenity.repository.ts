import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { IRoomAmenityRepository } from '@src/modules/amenity/domain/repositories/room-amenity.repository';
import { RoomAmenityOrmEntity } from '@src/modules/amenity/infrastructure/entities/room-amenity.orm-entity';

@Injectable()
export class RoomAmenityRepository implements IRoomAmenityRepository {
  constructor(
    @InjectRepository(RoomAmenityOrmEntity)
    private readonly repository: Repository<RoomAmenityOrmEntity>,
  ) {}

  async findAmenityIdsByRoomId(roomId: number): Promise<number[]> {
    const rows = await this.repository.find({
      where: { roomId },
      order: { amenityId: 'ASC' },
    });
    return rows.map((row) => row.amenityId);
  }

  async replaceForRoom(roomId: number, amenityIds: number[]): Promise<void> {
    await this.repository.manager.transaction(async (manager) => {
      await manager.delete(RoomAmenityOrmEntity, { roomId });

      if (amenityIds.length === 0) {
        return;
      }

      const uniqueIds = [...new Set(amenityIds)];
      await manager.save(
        uniqueIds.map((amenityId) =>
          manager.create(RoomAmenityOrmEntity, { roomId, amenityId }),
        ),
      );
    });
  }
}
