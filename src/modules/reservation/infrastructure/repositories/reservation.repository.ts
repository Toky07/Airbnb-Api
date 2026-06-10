import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  buildPaginationMeta,
  type PaginatedResult,
} from '../../../../shared/pagination/pagination.types';
import { BLOCKING_RESERVATION_STATUSES } from '../../domain/constants/reservation-status.constant';
import { Reservation } from '../../domain/entities/reservation.entity';
import type {
  IReservationRepository,
  ReservationListParams,
} from '../../domain/repositories/reservation.repository';
import { ReservationOrmEntity } from '../entities/reservation.orm-entity';
import { ReservationMapper } from '../mappers/reservation.mapper';
import { RoomEntity } from '../../../rooms/infrastructure/entities/room.entity';

@Injectable()
export class ReservationRepository implements IReservationRepository {
  constructor(
    @InjectRepository(ReservationOrmEntity)
    private readonly repository: Repository<ReservationOrmEntity>,
  ) {}

  async create(reservation: Reservation): Promise<Reservation> {
    const saved = await this.repository.save(
      this.repository.create(ReservationMapper.toEntity(reservation)),
    );
    return ReservationMapper.toDomain(saved);
  }

  async update(reservation: Reservation): Promise<Reservation> {
    const saved = await this.repository.save(
      ReservationMapper.toEntity(reservation),
    );
    return ReservationMapper.toDomain(saved);
  }

  async findById(id: number): Promise<Reservation | null> {
    const entity = await this.repository.findOne({ where: { id: Number(id) } });
    return entity ? ReservationMapper.toDomain(entity) : null;
  }

  async findPaginated(
    params: ReservationListParams,
  ): Promise<PaginatedResult<Reservation>> {
    const qb = this.repository
      .createQueryBuilder('reservation')
      .orderBy('reservation.createdAt', 'DESC');

    if (params.userId) {
      qb.andWhere('reservation.userId = :userId', { userId: params.userId });
    }

    if (params.roomId) {
      qb.andWhere('reservation.roomId = :roomId', { roomId: params.roomId });
    }

    if (params.propertyId) {
      qb.innerJoin(
        RoomEntity,
        'room',
        'room.id = reservation.roomId AND room.propertyId = :propertyId',
        { propertyId: params.propertyId },
      );
    }

    if (params.search) {
      const term = `%${params.search}%`;
      qb.andWhere(
        '(reservation.status LIKE :term OR reservation.startDate LIKE :term OR reservation.endDate LIKE :term)',
        { term },
      );
    }

    const [entities, total] = await qb
      .skip((params.page - 1) * params.limit)
      .take(params.limit)
      .getManyAndCount();

    return {
      data: entities.map((entity) => ReservationMapper.toDomain(entity)),
      meta: buildPaginationMeta(total, params.page, params.limit),
    };
  }

  async findOverlapping(
    roomId: number,
    startDate: string,
    endDate: string,
    excludeReservationId?: number,
  ): Promise<Reservation[]> {
    const qb = this.repository
      .createQueryBuilder('reservation')
      .where('reservation.roomId = :roomId', { roomId })
      .andWhere('reservation.status IN (:...statuses)', {
        statuses: BLOCKING_RESERVATION_STATUSES,
      })
      .andWhere('reservation.startDate < :endDate', { endDate })
      .andWhere('reservation.endDate > :startDate', { startDate });

    if (excludeReservationId) {
      qb.andWhere('reservation.id != :excludeReservationId', {
        excludeReservationId,
      });
    }

    const entities = await qb.getMany();
    return entities.map((entity) => ReservationMapper.toDomain(entity));
  }
}
