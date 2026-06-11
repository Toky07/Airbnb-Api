import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThan, Repository } from 'typeorm';
import {
  buildPaginationMeta,
  type PaginatedResult,
} from '../../../../shared/pagination/pagination.types';
import { BLOCKING_RESERVATION_STATUSES, RESERVATION_STATUS } from '../../domain/constants/reservation-status.constant';
import { Reservation } from '../../domain/entities/reservation.entity';
import type {
  IReservationRepository,
  ReservationListParams,
  ReservationStatsScope,
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
    if (!Number.isFinite(id) || id <= 0) {
      return null;
    }

    const entity = await this.repository.findOne({ where: { id } });
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

    if (params.propertyIds?.length) {
      qb.innerJoin(
        RoomEntity,
        'room',
        'room.id = reservation.roomId AND room.propertyId IN (:...propertyIds)',
        { propertyIds: params.propertyIds },
      );
    } else if (params.propertyId != null && params.propertyId > 0) {
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

  async countByScope(
    scope: ReservationStatsScope,
    status?: Reservation['status'],
  ): Promise<number> {
    const qb = this.repository.createQueryBuilder('reservation');
    this.applyScope(qb, scope);

    if (status) {
      qb.andWhere('reservation.status = :status', { status });
    }

    return qb.getCount();
  }

  async sumConfirmedRevenueForMonth(
    year: number,
    month: number,
    scope: ReservationStatsScope = {},
  ): Promise<number> {
    const { start, end } = this.getMonthRange(year, month);
    const qb = this.repository
      .createQueryBuilder('reservation')
      .select('COALESCE(SUM(reservation.totalPrice), 0)', 'total')
      .where('reservation.status = :status', {
        status: RESERVATION_STATUS.CONFIRMED,
      })
      .andWhere('reservation.startDate >= :start', { start })
      .andWhere('reservation.startDate < :end', { end });

    this.applyScope(qb, scope);

    const result = await qb.getRawOne<{ total: number | string | null }>();
    return Number(result?.total ?? 0);
  }

  async sumConfirmedNightsForMonth(
    year: number,
    month: number,
    scope: ReservationStatsScope = {},
  ): Promise<number> {
    const { start, end } = this.getMonthRange(year, month);
    const qb = this.repository
      .createQueryBuilder('reservation')
      .select('COALESCE(SUM(reservation.nights), 0)', 'total')
      .where('reservation.status = :status', {
        status: RESERVATION_STATUS.CONFIRMED,
      })
      .andWhere('reservation.startDate >= :start', { start })
      .andWhere('reservation.startDate < :end', { end });

    this.applyScope(qb, scope);

    const result = await qb.getRawOne<{ total: number | string | null }>();
    return Number(result?.total ?? 0);
  }

  async findRecent(
    limit: number,
    scope: ReservationStatsScope = {},
  ): Promise<Reservation[]> {
    const qb = this.repository
      .createQueryBuilder('reservation')
      .orderBy('reservation.createdAt', 'DESC')
      .take(Math.max(1, Math.min(limit, 20)));

    this.applyScope(qb, scope);

    const entities = await qb.getMany();
    return entities.map((entity) => ReservationMapper.toDomain(entity));
  }

  async findByIds(ids: number[]): Promise<Reservation[]> {
    const uniqueIds = [...new Set(ids.filter((id) => Number.isFinite(id) && id > 0))];
    if (uniqueIds.length === 0) {
      return [];
    }

    const entities = await this.repository.find({
      where: { id: In(uniqueIds) },
      order: { createdAt: 'ASC' },
    });

    return entities.map((entity) => ReservationMapper.toDomain(entity));
  }

  async findIdsByFilters(
    params: Omit<ReservationListParams, 'page' | 'limit'>,
  ): Promise<number[]> {
    const qb = this.repository
      .createQueryBuilder('reservation')
      .select('reservation.id', 'id');

    if (params.userId) {
      qb.andWhere('reservation.userId = :userId', { userId: params.userId });
    }

    if (params.roomId) {
      qb.andWhere('reservation.roomId = :roomId', { roomId: params.roomId });
    }

    if (params.propertyIds?.length) {
      qb.innerJoin(
        RoomEntity,
        'room',
        'room.id = reservation.roomId AND room.propertyId IN (:...propertyIds)',
        { propertyIds: params.propertyIds },
      );
    } else if (params.propertyId != null && params.propertyId > 0) {
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

    const rows = await qb.getRawMany<{ id: number }>();
    return rows.map((row) => Number(row.id)).filter((id) => id > 0);
  }

  async findIdsByPropertyId(propertyId: number): Promise<number[]> {
    return this.findIdsByPropertyIds([propertyId]);
  }

  async findIdsByPropertyIds(propertyIds: number[]): Promise<number[]> {
    const ids = propertyIds.filter((id) => Number.isFinite(id) && id > 0);
    if (ids.length === 0) {
      return [];
    }

    const rows = await this.repository
      .createQueryBuilder('reservation')
      .select('reservation.id', 'id')
      .innerJoin(RoomEntity, 'room', 'room.id = reservation.roomId')
      .where('room.propertyId IN (:...propertyIds)', { propertyIds: ids })
      .getRawMany<{ id: number }>();

    return rows.map((row) => Number(row.id)).filter((id) => id > 0);
  }

  async clearExpiredReservations(): Promise<void> {
    await this.repository.delete({
      createdAt: LessThan(new Date(Date.now() - 1000 * 60 * 20)),
      status: RESERVATION_STATUS.PENDING,
    });
  }

  private applyScope(
    qb: ReturnType<Repository<ReservationOrmEntity>['createQueryBuilder']>,
    scope: ReservationStatsScope,
  ): void {
    if (scope.propertyIds?.length) {
      qb.innerJoin(
        RoomEntity,
        'room',
        'room.id = reservation.roomId AND room.propertyId IN (:...propertyIds)',
        { propertyIds: scope.propertyIds },
      );
      return;
    }

    if (scope.propertyId === -1) {
      qb.andWhere('1 = 0');
      return;
    }

    if (scope.propertyId != null && scope.propertyId > 0) {
      qb.innerJoin(
        RoomEntity,
        'room',
        'room.id = reservation.roomId AND room.propertyId = :propertyId',
        { propertyId: scope.propertyId },
      );
    }
  }

  private getMonthRange(year: number, month: number): { start: string; end: string } {
    const start = `${year}-${String(month).padStart(2, '0')}-01`;
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    const end = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;
    return { start, end };
  }
}
