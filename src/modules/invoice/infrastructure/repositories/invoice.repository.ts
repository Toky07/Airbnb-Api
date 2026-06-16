import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { InvoicePaymentType } from '../../domain/constants/invoice-payment-type.constant';
import { Invoice } from '../../domain/entities/invoice.entity';
import type { IInvoiceRepository } from '../../domain/repositories/invoice.repository';
import { InvoiceOrmEntity } from '../entities/invoice.orm-entity';
import { InvoiceMapper } from '../mappers/invoice.mapper';

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
}
