import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  buildPaginationMeta,
  type PaginatedResult,
  type PaginationParams,
} from '../../../../shared/pagination/pagination.types';
import type { InvoicePaymentType } from '../../domain/constants/invoice-payment-type.constant';
import { Invoice } from '../../domain/entities/invoice.entity';
import type { IInvoiceRepository } from '../../domain/repositories/invoice.repository';
import type { InvoiceListRecord } from '../../domain/types/invoice-list-record.type';
import { InvoiceOrmEntity } from '../entities/invoice.orm-entity';
import { InvoiceMapper } from '../mappers/invoice.mapper';

type RawInvoiceListRow = {
  id: string | number;
  invoiceNumber: string;
  paymentType: string;
  paymentId: string | number;
  userId: string | number;
  createdAt: Date | string;
  customerName: string | null;
  customerEmail: string | null;
};

function mapRawInvoiceListRow(row: RawInvoiceListRow): InvoiceListRecord {
  return {
    id: Number(row.id),
    invoiceNumber: row.invoiceNumber,
    paymentType: row.paymentType,
    paymentId: Number(row.paymentId),
    userId: Number(row.userId),
    customerName: row.customerName?.trim() || '—',
    customerEmail: row.customerEmail?.trim() || '—',
    createdAt:
      row.createdAt instanceof Date ? row.createdAt : new Date(row.createdAt),
  };
}

@Injectable()
export class InvoiceRepository implements IInvoiceRepository {
  constructor(
    @InjectRepository(InvoiceOrmEntity)
    private readonly repository: Repository<InvoiceOrmEntity>,
  ) {}

  async create(invoice: Invoice): Promise<Invoice> {
    const saved = await this.repository.save(
      this.repository.create(InvoiceMapper.toEntity(invoice)),
    );
    return InvoiceMapper.toDomain(saved);
  }

  async findByPayment(
    paymentType: InvoicePaymentType,
    paymentId: number,
  ): Promise<Invoice | null> {
    const entity = await this.repository.findOne({
      where: { paymentType, paymentId },
    });
    return entity ? InvoiceMapper.toDomain(entity) : null;
  }

  async findById(id: number): Promise<Invoice | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? InvoiceMapper.toDomain(entity) : null;
  }

  async findByUserId(userId: number): Promise<Invoice[]> {
    const entities = await this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return entities.map((entity) => InvoiceMapper.toDomain(entity));
  }

  async findPaginated(
    params: PaginationParams,
  ): Promise<PaginatedResult<InvoiceListRecord>> {
    const baseQb = this.repository
      .createQueryBuilder('invoice')
      .leftJoin('users', 'user', 'user.id = invoice.userId');

    if (params.search) {
      const term = `%${params.search}%`;
      baseQb.andWhere(
        `(invoice.invoiceNumber ILIKE :term OR user.email ILIKE :term OR user.firstName ILIKE :term OR user.lastName ILIKE :term OR CAST(invoice.paymentId AS TEXT) LIKE :term)`,
        { term },
      );
    }

    const total = await baseQb.clone().getCount();

    const rows = await baseQb
      .select('invoice.id', 'id')
      .addSelect('invoice.invoiceNumber', 'invoiceNumber')
      .addSelect('invoice.paymentType', 'paymentType')
      .addSelect('invoice.paymentId', 'paymentId')
      .addSelect('invoice.userId', 'userId')
      .addSelect('invoice.createdAt', 'createdAt')
      .addSelect(
        "TRIM(CONCAT(COALESCE(user.firstName, ''), ' ', COALESCE(user.lastName, '')))",
        'customerName',
      )
      .addSelect('user.email', 'customerEmail')
      .orderBy('invoice.createdAt', 'DESC')
      .offset((params.page - 1) * params.limit)
      .limit(params.limit)
      .getRawMany<RawInvoiceListRow>();

    return {
      data: rows.map(mapRawInvoiceListRow),
      meta: buildPaginationMeta(total, params.page, params.limit),
    };
  }
}
