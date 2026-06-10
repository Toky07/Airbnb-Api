import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  buildPaginationMeta,
  type PaginatedResult,
  type PaginationParams,
} from '../../../../shared/pagination/pagination.types';
import { Payment } from '../../domain/entities/payment.entity';
import type { IPaymentRepository } from '../../domain/repositories/payment.repository';
import { PaymentOrmEntity } from '../entities/payment.orm-entity';
import { PaymentMapper } from '../mappers/payment.mapper';

@Injectable()
export class PaymentRepository implements IPaymentRepository {
  constructor(
    @InjectRepository(PaymentOrmEntity)
    private readonly repository: Repository<PaymentOrmEntity>,
  ) {}

  async create(payment: Payment): Promise<Payment> {
    const saved = await this.repository.save(
      this.repository.create(PaymentMapper.toEntity(payment)),
    );
    return PaymentMapper.toDomain(saved);
  }

  async update(payment: Payment): Promise<Payment> {
    const saved = await this.repository.save(PaymentMapper.toEntity(payment));
    return PaymentMapper.toDomain(saved);
  }

  async findById(id: number): Promise<Payment | null> {
    if (!Number.isFinite(id) || id <= 0) {
      return null;
    }

    const entity = await this.repository.findOne({ where: { id } });
    return entity ? PaymentMapper.toDomain(entity) : null;
  }

  async findByTransactionId(transactionId: string): Promise<Payment | null> {
    const entity = await this.repository.findOne({
      where: { transactionId: transactionId.trim() },
    });
    return entity ? PaymentMapper.toDomain(entity) : null;
  }

  async findPaginated(
    params: PaginationParams,
  ): Promise<PaginatedResult<Payment>> {
    const qb = this.repository
      .createQueryBuilder('payment')
      .orderBy('payment.createdAt', 'DESC');

    if (params.search) {
      const term = `%${params.search}%`;
      qb.andWhere(
        '(payment.transactionId LIKE :term OR payment.status LIKE :term OR payment.currency LIKE :term)',
        { term },
      );
    }

    const [entities, total] = await qb
      .skip((params.page - 1) * params.limit)
      .take(params.limit)
      .getManyAndCount();

    return {
      data: entities.map((entity) => PaymentMapper.toDomain(entity)),
      meta: buildPaginationMeta(total, params.page, params.limit),
    };
  }

  async findPaginatedForReservationIds(
    reservationIds: number[],
    params: PaginationParams,
  ): Promise<PaginatedResult<Payment>> {
    const uniqueIds = [
      ...new Set(reservationIds.filter((id) => Number.isFinite(id) && id > 0)),
    ];

    if (uniqueIds.length === 0) {
      return {
        data: [],
        meta: buildPaginationMeta(0, params.page, params.limit),
      };
    }

    const qb = this.repository
      .createQueryBuilder('payment')
      .where(
        `(
          payment.reservationId IN (:...reservationIds)
          OR EXISTS (
            SELECT 1 FROM json_each(payment.reservationIds) AS reservationRef
            WHERE CAST(reservationRef.value AS INTEGER) IN (:...reservationIds)
          )
        )`,
        { reservationIds: uniqueIds },
      )
      .orderBy('payment.createdAt', 'DESC');

    if (params.search) {
      const term = `%${params.search}%`;
      qb.andWhere(
        '(payment.transactionId LIKE :term OR payment.status LIKE :term OR payment.currency LIKE :term)',
        { term },
      );
    }

    const [entities, total] = await qb
      .skip((params.page - 1) * params.limit)
      .take(params.limit)
      .getManyAndCount();

    return {
      data: entities.map((entity) => PaymentMapper.toDomain(entity)),
      meta: buildPaginationMeta(total, params.page, params.limit),
    };
  }
}
