import { PAYMENT_PROVIDER } from '../../domain/constants/payment-provider.constant';
import type { PaymentStatus } from '../../domain/constants/payment-status.constant';
import { Payment } from '../../domain/entities/payment.entity';
import { PaymentOrmEntity } from '../entities/payment.orm-entity';
import { PaymentType } from '../../domain/types/payment.type';

export class PaymentMapper {
  static toDomain(entity: PaymentOrmEntity): Payment {
    return new Payment(
      entity.amount,
      entity.currency,
      entity.status as PaymentStatus,
      entity.provider as (typeof PAYMENT_PROVIDER)[keyof typeof PAYMENT_PROVIDER],
      entity.transactionId,
      entity.userId,
      entity.propertyType as PaymentType,
      entity.propertyId,
      entity.cartId ?? null,
      entity.errorMessage,
      entity.id,
      entity.createdAt,
      entity.updatedAt,
      entity.invoiceNotificationsSentAt ?? null,
    );
  }

  static toEntity(payment: Payment): PaymentOrmEntity {
    const entity = new PaymentOrmEntity();
    if (payment.id !== undefined) {
      entity.id = payment.id;
    }
    entity.amount = payment.amount;
    entity.currency = payment.currency;
    entity.status = payment.status;
    entity.provider = payment.provider;
    entity.transactionId = payment.transactionId;
    entity.cartId = payment.cartId;
    entity.userId = payment.userId;
    entity.propertyType = payment.propertyType;
    entity.propertyId = payment.propertyId;
    entity.errorMessage = payment.errorMessage;
    entity.invoiceNotificationsSentAt = payment.invoiceNotificationsSentAt;
    return entity;
  }
}
