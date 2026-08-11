import type { InvoicePaymentType } from '@src/modules/invoice/domain/constants/invoice-payment-type.constant';
import { Invoice } from '@src/modules/invoice/domain/entities/invoice.entity';
import { InvoiceOrmEntity } from '@src/modules/invoice/infrastructure/entities/invoice.orm-entity';

export class InvoiceMapper {
  static toDomain(entity: InvoiceOrmEntity): Invoice {
    return new Invoice(
      entity.userId,
      entity.paymentType as InvoicePaymentType,
      entity.paymentId,
      entity.path,
      entity.invoiceNumber,
      entity.id,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static toEntity(invoice: Invoice): InvoiceOrmEntity {
    const entity = new InvoiceOrmEntity();
    if (invoice.id) {
      entity.id = invoice.id;
    }
    entity.userId = invoice.userId;
    entity.paymentType = invoice.paymentType;
    entity.paymentId = invoice.paymentId;
    entity.path = invoice.path;
    entity.invoiceNumber = invoice.invoiceNumber;
    return entity;
  }
}
