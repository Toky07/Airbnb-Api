import { PAYMENT_PROVIDER } from '../../domain/constants/payment-provider.constant';
import type { PaymentStatus } from '../../domain/constants/payment-status.constant';
import { Payment } from '../../domain/entities/payment.entity';
import { PaymentOrmEntity } from '../entities/payment.orm-entity';
import { PaymentType } from '../../domain/types/payment.type';

export class PaymentMapper {
  static toDomain(entity: PaymentOrmEntity): Payment {
    return Payment.create({
      amount: entity.amount,
      currency: entity.currency,
      status: entity.status as PaymentStatus,
      provider:
        entity.provider as (typeof PAYMENT_PROVIDER)[keyof typeof PAYMENT_PROVIDER],
      transactionId: entity.transactionId,
      userId: entity.userId,
      propertyType: entity.propertyType as PaymentType,
      propertyId: entity.propertyId,
      cartId: entity.cartId ?? null,
      errorMessage: entity.errorMessage,
      id: entity.id,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      invoiceNotificationsSentAt: entity.invoiceNotificationsSentAt ?? null,
      refundedAmount: entity.refundedAmount ?? 0,
      refundTransactionId: entity.refundTransactionId ?? null,
    });
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
    entity.transactionId = payment.transactionId ?? '';
    entity.cartId = payment.cartId;
    entity.userId = payment.userId;
    entity.propertyType = payment.propertyType;
    entity.propertyId = payment.propertyId;
    entity.errorMessage = payment.errorMessage;
    entity.invoiceNotificationsSentAt = payment.invoiceNotificationsSentAt;
    entity.refundedAmount = payment.refundedAmount;
    entity.refundTransactionId = payment.refundTransactionId;
    return entity;
  }
}
