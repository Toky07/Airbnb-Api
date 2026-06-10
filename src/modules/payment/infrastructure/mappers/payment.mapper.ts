import { PAYMENT_PROVIDER } from '../../domain/constants/payment-provider.constant';
import type { PaymentStatus } from '../../domain/constants/payment-status.constant';
import { Payment } from '../../domain/entities/payment.entity';
import { PaymentOrmEntity } from '../entities/payment.orm-entity';

export class PaymentMapper {
  static toDomain(entity: PaymentOrmEntity): Payment {
    return new Payment(
      entity.amount,
      entity.currency,
      entity.status as PaymentStatus,
      entity.provider as (typeof PAYMENT_PROVIDER)[keyof typeof PAYMENT_PROVIDER],
      entity.transactionId,
      entity.userId,
      entity.roomId,
      entity.checkInDate,
      entity.checkOutDate,
      entity.guestCount,
      entity.nights,
      entity.reservationId,
      entity.cartId ?? null,
      entity.reservationIds ?? [],
      entity.errorMessage,
      entity.id,
      entity.createdAt,
      entity.updatedAt,
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
    entity.reservationId = payment.reservationId;
    entity.cartId = payment.cartId;
    entity.reservationIds = payment.reservationIds;
    entity.userId = payment.userId;
    entity.roomId = payment.roomId;
    entity.checkInDate = payment.checkInDate;
    entity.checkOutDate = payment.checkOutDate;
    entity.guestCount = payment.guestCount;
    entity.nights = payment.nights;
    entity.errorMessage = payment.errorMessage;
    return entity;
  }
}
