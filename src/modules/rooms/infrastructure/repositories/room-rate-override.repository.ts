import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoomRateOverride } from '@src/modules/rooms/domain/entities/room-rate-override.entity';
import type { IRoomRateOverrideRepository } from '@src/modules/rooms/domain/repositories/room-rate-override.repository';
import { RoomRateOverrideOrmEntity } from '@src/modules/rooms/infrastructure/entities/room-rate-override.orm-entity';
import { RoomRateOverrideMapper } from '@src/modules/rooms/infrastructure/mappers/room-rate-override.mapper';

@Injectable()
export class RoomRateOverrideRepository implements IRoomRateOverrideRepository {
  constructor(
    @InjectRepository(RoomRateOverrideOrmEntity)
    private readonly repository: Repository<RoomRateOverrideOrmEntity>,
  ) {}

  async create(override: RoomRateOverride): Promise<RoomRateOverride> {
    const entity = this.repository.create(
      RoomRateOverrideMapper.toEntity(override),
    );
    const saved = await this.repository.save(entity);
    return RoomRateOverrideMapper.toDomain(saved);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async findById(id: number): Promise<RoomRateOverride | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? RoomRateOverrideMapper.toDomain(entity) : null;
  }

  async findByRoomId(roomId: number): Promise<RoomRateOverride[]> {
    const entities = await this.repository.find({
      where: { roomId },
      order: { startDate: 'ASC' },
    });
    return entities.map((entity) => RoomRateOverrideMapper.toDomain(entity));
  }

  async findOverlapping(
    roomId: number,
    startDate: string,
    endDate: string,
  ): Promise<RoomRateOverride[]> {
    const entities = await this.repository
      .createQueryBuilder('override')
      .where('override.roomId = :roomId', { roomId })
      .andWhere('override.startDate < :endDate', { endDate })
      .andWhere('override.endDate > :startDate', { startDate })
      .getMany();

    return entities.map((entity) => RoomRateOverrideMapper.toDomain(entity));
  }
}
