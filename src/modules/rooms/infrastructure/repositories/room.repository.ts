import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  buildPaginationMeta,
  type PaginatedResult,
  type PaginationParams,
} from '../../../../shared/pagination/pagination.types';
import { BLOCKING_RESERVATION_STATUSES } from '../../../reservation/contracts';
import { Room } from '../../domain/entities/room.entity';
import { RoomEntity } from '../entities/room.entity';
import { IRoomRepository } from '../../domain/repositories/room.repository';
import { RoomMapper } from '../mappers/room.mapper';
import { applyRoomListFilters } from './apply-room-list-filters';

@Injectable()
export class RoomRepository implements IRoomRepository {
  constructor(
    @InjectRepository(RoomEntity)
    private readonly repository: Repository<RoomEntity>,
  ) {}

  async create(room: Room): Promise<Room> {
    const data = this.repository.create(RoomMapper.toEntity(room));
    const newRoom = await this.repository.save(data);
    const reloaded = await this.findById(newRoom.id);
    if (!reloaded) {
      throw new Error('Room not found after create');
    }
    return reloaded;
  }

  async findAll(): Promise<Room[]> {
    const rooms = await this.repository.find({
      relations: ['property', 'roomType'],
    });
    return rooms.map((room) => RoomMapper.toDomain(room));
  }

  async findPaginated(
    params: PaginationParams,
  ): Promise<PaginatedResult<Room>> {
    const qb = this.repository
      .createQueryBuilder('room')
      .leftJoinAndSelect('room.property', 'property')
      .leftJoinAndSelect('room.roomType', 'roomType')
      .orderBy('room.name', 'ASC');

    applyRoomListFilters(qb, params);

    if (params.checkIn && params.checkOut) {
      qb.andWhere(
        `NOT EXISTS (
          SELECT 1 FROM reservation_items item
          INNER JOIN reservations reservation ON reservation.id = item."reservationId"
          WHERE item."roomId" = room.id
            AND item."checkIn" < :checkOut
            AND item."checkOut" > :checkIn
            AND reservation.status IN (:...blockingStatuses)
        )`,
        {
          checkIn: params.checkIn,
          checkOut: params.checkOut,
          blockingStatuses: BLOCKING_RESERVATION_STATUSES,
        },
      );
      qb.andWhere(
        `NOT EXISTS (
          SELECT 1 FROM room_blocked_dates blocked
          WHERE blocked."roomId" = room.id
            AND blocked."startDate" < :checkOut
            AND blocked."endDate" > :checkIn
        )`,
        {
          checkIn: params.checkIn,
          checkOut: params.checkOut,
        },
      );
    }

    const [entities, total] = await qb
      .skip((params.page - 1) * params.limit)
      .take(params.limit)
      .getManyAndCount();

    return {
      data: entities.map((entity) => RoomMapper.toDomain(entity)),
      meta: buildPaginationMeta(total, params.page, params.limit),
    };
  }

  async findById(id: number): Promise<Room | null> {
    const room = await this.repository.findOne({
      where: { id: Number(id) },
      relations: ['property', 'roomType'],
    });

    return room ? RoomMapper.toDomain(room) : null;
  }

  async findBySlug(slug: string): Promise<Room | null> {
    const room = await this.repository.findOne({
      where: { slug },
      relations: ['property', 'roomType'],
    });

    return room ? RoomMapper.toDomain(room) : null;
  }

  async update(room: Room): Promise<Room> {
    const data = await this.repository.preload({
      ...RoomMapper.toEntity(room),
      id: +room.id!,
    });

    if (!data) {
      throw new Error('Room not found');
    }

    await this.repository.save(data);
    const reloaded = await this.findById(room.id!);
    if (!reloaded) {
      throw new Error('Room not found after update');
    }
    return reloaded;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected ? true : false;
  }
}
