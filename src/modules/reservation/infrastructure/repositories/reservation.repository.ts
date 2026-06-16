import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThan, Repository } from 'typeorm';
import {
  buildPaginationMeta,
  type PaginatedResult,
} from '../../../../shared/pagination/pagination.types';
import { BLOCKING_RESERVATION_STATUSES, RESERVATION_STATUS } from '../../domain/constants/reservation-status.constant';
import { Reservation } from '../../domain/entities/reservation.entity';
import type { ReservationItem } from '../../domain/entities/reservation-item.entity';
import type {
  IReservationRepository,
  ReservationListParams,
  ReservationStatsScope,
} from '../../domain/repositories/reservation.repository';
import { ReservationItemOrmEntity } from '../entities/reservation-item.orm-entity';
import { ReservationOrmEntity } from '../entities/reservation.orm-entity';
import { ReservationItemMapper } from '../mappers/reservation-item.mapper';
import { ReservationMapper } from '../mappers/reservation.mapper';
import { RoomEntity } from '../../../rooms/infrastructure/entities/room.entity';
import { ReservationStatus } from '../../domain/constants/reservation-status.constant';
import { type IPaymentRepository, PAYMENT_REPOSITORY } from '../../../payment/domain/repositories/payment.repository';

@Injectable()
export class ReservationRepository implements IReservationRepository {
  constructor(
    @InjectRepository(ReservationOrmEntity)
    private readonly repository: Repository<ReservationOrmEntity>,
    @InjectRepository(ReservationItemOrmEntity)
    private readonly itemRepository: Repository<ReservationItemOrmEntity>,
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
  ) {}

  async create(reservation: Reservation): Promise<Reservation> {
    const saved = await this.repository.save(
      this.repository.create(ReservationMapper.toEntity(reservation)),
    );
    
    const loaded = await this.repository.findOne({
      where: { id: saved.id },
      relations: ['items'],
    });
    return ReservationMapper.toDomain(loaded!);
  }

  async update(reservation: Reservation): Promise<Reservation> {
    const updatedReservation = await this.repository.preload(
      ReservationMapper.toEntity(reservation)
    );

    const saved = await this.repository.save(updatedReservation!);

    return ReservationMapper.toDomain(saved!);
  }

  async setPayment(reservation: Reservation, paymentId: number): Promise<void> {
    await this.repository.update(reservation.id!, { payment: { id: paymentId } });
  }

  async updateItem(item: ReservationItem): Promise<ReservationItem> {
    const saved = await this.itemRepository.save(
      ReservationItemMapper.toEntity(item),
    );
    return ReservationItemMapper.toDomain(saved);
  }

  async findById(id: number): Promise<Reservation | null> {
    if (!Number.isFinite(id) || id <= 0) {
      return null;
    }

    const entity = await this.repository.findOne({
      where: { id },
      relations: ['items', 'payment'],
    });
    return entity ? ReservationMapper.toDomain(entity) : null;
  }

  async findItemById(id: number): Promise<ReservationItem | null> {
    if (!Number.isFinite(id) || id <= 0) {
      return null;
    }

    const entity = await this.itemRepository.findOne({ where: { id } });
    return entity ? ReservationItemMapper.toDomain(entity) : null;
  }

  async findItemsByIds(ids: number[]): Promise<ReservationItem[]> {
    const uniqueIds = [...new Set(ids.filter((id) => Number.isFinite(id) && id > 0))];
    if (uniqueIds.length === 0) {
      return [];
    }

    const entities = await this.itemRepository.find({
      where: { id: In(uniqueIds) },
      order: { createdAt: 'ASC' },
    });

    return entities.map((entity) => ReservationItemMapper.toDomain(entity));
  }

  async findPaginated(
    params: ReservationListParams,
  ): Promise<PaginatedResult<Reservation>> {
    const qb = this.repository
      .createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.items', 'item')
      .orderBy('reservation.createdAt', 'DESC');

    if (params.userId) {
      qb.andWhere('reservation.userId = :userId', { userId: params.userId });
    }

    if (params.roomId) {
      qb.andWhere('item.roomId = :roomId', { roomId: params.roomId });
    }

    this.applyPropertyScope(qb, params.propertyIds, params.propertyId);

    if (params.search) {
      const term = `%${params.search}%`;
      qb.andWhere(
        '(item.checkIn LIKE :term OR item.checkOut LIKE :term)',
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
    checkIn: string,
    checkOut: string,
    excludeItemId?: number,
  ): Promise<ReservationItem[]> {
    const qb = this.itemRepository
      .createQueryBuilder('item')
      .where('item.roomId = :roomId', { roomId })
      .andWhere('item.checkIn < :checkOut', { checkOut })
      .andWhere('item.checkOut > :checkIn', { checkIn });

    if (excludeItemId) {
      qb.andWhere('item.id != :excludeItemId', { excludeItemId });
    }

    const entities = await qb.getMany();
    return entities.map((entity) => ReservationItemMapper.toDomain(entity));
  }

  async countByScope(
    scope: ReservationStatsScope,
    status?: ReservationStatus,
  ): Promise<number> {
    const tests = await this.repository.count({
        where: {
          status
        }
      });
    
    return tests;
  }

  async sumConfirmedRevenueForMonth(
    year: number,
    month: number,
    scope: ReservationStatsScope = {},
  ): Promise<number> {
    const { start, end } = this.getMonthRange(year, month);
    const qb = this.itemRepository
      .createQueryBuilder('item')
      .select('COALESCE(SUM(item.price), 0)', 'total')
      .andWhere('item.checkIn >= :start', { start })
      .andWhere('item.checkIn < :end', { end });

    this.applyItemScope(qb, scope);

    const result = await qb.getRawOne<{ total: number | string | null }>();
    return Number(result?.total ?? 0);
  }

  async sumConfirmedNightsForMonth(
    year: number,
    month: number,
    scope: ReservationStatsScope = {},
  ): Promise<number> {
    const { start, end } = this.getMonthRange(year, month);
    const qb = this.itemRepository
      .createQueryBuilder('item')
      .select('COALESCE(SUM(item.nights), 0)', 'total')
      .andWhere('item.checkIn >= :start', { start })
      .andWhere('item.checkIn < :end', { end });

    this.applyItemScope(qb, scope);

    const result = await qb.getRawOne<{ total: number | string | null }>();
    return Number(result?.total ?? 0);
  }

  async findRecentItems(
    limit: number,
    scope: ReservationStatsScope = {},
  ): Promise<ReservationItem[]> {
    const qb = this.itemRepository
      .createQueryBuilder('item')
      .orderBy('item.createdAt', 'DESC')
      .take(Math.max(1, Math.min(limit, 20)));

    this.applyItemScope(qb, scope);

    const entities = await qb.getMany();
    return entities.map((entity) => ReservationItemMapper.toDomain(entity));
  }

  async findByIds(ids: number[]): Promise<Reservation[]> {
    const uniqueIds = [...new Set(ids.filter((id) => Number.isFinite(id) && id > 0))];
    if (uniqueIds.length === 0) {
      return [];
    }

    const entities = await this.repository.find({
      where: { id: In(uniqueIds) },
      relations: ['items'],
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
      qb.innerJoin('reservation.items', 'item', 'item.roomId = :roomId', {
        roomId: params.roomId,
      });
    }

    this.applyPropertyScope(qb, params.propertyIds, params.propertyId);

    if (params.search) {
      qb.innerJoin('reservation.items', 'searchItem');
      const term = `%${params.search}%`;
      qb.andWhere(
        '(searchItem.checkIn LIKE :term OR searchItem.checkOut LIKE :term)',
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

    const rows = await this.itemRepository
      .createQueryBuilder('item')
      .select('DISTINCT item.reservationId', 'id')
      .innerJoin(RoomEntity, 'room', 'room.id = item.roomId')
      .where('room.propertyId IN (:...propertyIds)', { propertyIds: ids })
      .getRawMany<{ id: number }>();

    return rows.map((row) => Number(row.id)).filter((id) => id > 0);
  }

  async clearExpiredReservations(): Promise<void> {
    const threshold = new Date(Date.now() - 1000 * 60 * 20);

    await this.repository.delete({
      status: RESERVATION_STATUS.PENDING,
      createdAt: LessThan(threshold),
    });
  }

  async findByPaymentId(paymentId: number): Promise<Reservation | null> {
    const entity = await this.repository.findOne({
      where: { payment: { id: paymentId } },
      relations: ['items', 'payment'],
    });
    
    return entity ? ReservationMapper.toDomain(entity) : null;
  }

  private applyPropertyScope(
    qb: ReturnType<Repository<ReservationOrmEntity>['createQueryBuilder']>,
    propertyIds?: number[],
    propertyId?: number,
  ): void {
    if (propertyIds?.length) {
      qb.innerJoin(
        RoomEntity,
        'room',
        'room.id = item.roomId AND room.propertyId IN (:...propertyIds)',
        { propertyIds },
      );
      return;
    }

    if (propertyId != null && propertyId > 0) {
      qb.innerJoin(
        RoomEntity,
        'room',
        'room.id = item.roomId AND room.propertyId = :propertyId',
        { propertyId },
      );
    }
  }

  private applyItemScope(
    qb: ReturnType<Repository<ReservationItemOrmEntity>['createQueryBuilder']>,
    scope: ReservationStatsScope,
  ): void {
    if (scope.propertyIds?.length) {
      qb.innerJoin(
        RoomEntity,
        'room',
        'room.id = item.roomId AND room.propertyId IN (:...propertyIds)',
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
        'room.id = item.roomId AND room.propertyId = :propertyId',
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
