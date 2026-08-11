import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoomBlockedDate } from '@src/modules/rooms/domain/entities/room-blocked-date.entity';
import type { IRoomBlockedDateRepository } from '@src/modules/rooms/domain/repositories/room-blocked-date.repository';
import { RoomBlockedDateOrmEntity } from '@src/modules/rooms/infrastructure/entities/room-blocked-date.orm-entity';
import { RoomBlockedDateMapper } from '@src/modules/rooms/infrastructure/mappers/room-blocked-date.mapper';

@Injectable()
export class RoomBlockedDateRepository implements IRoomBlockedDateRepository {
  constructor(
    @InjectRepository(RoomBlockedDateOrmEntity)
    private readonly repository: Repository<RoomBlockedDateOrmEntity>,
  ) {}

  async create(blockedDate: RoomBlockedDate): Promise<RoomBlockedDate> {
    const entity = this.repository.create(
      RoomBlockedDateMapper.toEntity(blockedDate),
    );
    const saved = await this.repository.save(entity);
    return RoomBlockedDateMapper.toDomain(saved);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async findById(id: number): Promise<RoomBlockedDate | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? RoomBlockedDateMapper.toDomain(entity) : null;
  }

  async findByRoomId(roomId: number): Promise<RoomBlockedDate[]> {
    const entities = await this.repository.find({
      where: { roomId },
      order: { startDate: 'ASC' },
    });
    return entities.map((entity) => RoomBlockedDateMapper.toDomain(entity));
  }

  async findOverlapping(
    roomId: number,
    startDate: string,
    endDate: string,
  ): Promise<RoomBlockedDate[]> {
    const entities = await this.repository
      .createQueryBuilder('blocked')
      .where('blocked.roomId = :roomId', { roomId })
      .andWhere('blocked.startDate < :endDate', { endDate })
      .andWhere('blocked.endDate > :startDate', { startDate })
      .getMany();

    return entities.map((entity) => RoomBlockedDateMapper.toDomain(entity));
  }

  async findRoomIdsUnavailable(
    checkIn: string,
    checkOut: string,
  ): Promise<number[]> {
    const rows = await this.repository
      .createQueryBuilder('blocked')
      .select('DISTINCT blocked.roomId', 'roomId')
      .where('blocked.startDate < :checkOut', { checkOut })
      .andWhere('blocked.endDate > :checkIn', { checkIn })
      .getRawMany<{ roomId: number }>();

    return rows.map((row) => Number(row.roomId)).filter((id) => id > 0);
  }
}
