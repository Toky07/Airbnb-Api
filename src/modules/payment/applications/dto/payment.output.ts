import type { PaymentProvider } from '../../domain/constants/payment-provider.constant';
import type { PaymentStatus } from '../../domain/constants/payment-status.constant';
import type { Payment } from '../../domain/entities/payment.entity';

export class PaymentOutput {
  constructor(
    public readonly id: number,
    public readonly amount: number,
    public readonly currency: string,
    public readonly status: PaymentStatus,
    public readonly provider: PaymentProvider,
    public readonly transactionId: string,
    public readonly userId: number,
    public readonly roomId: number,
    public readonly reservationId: number | null,
    public readonly cartId: number | null,
    public readonly reservationIds: number[],
    public readonly checkInDate: string,
    public readonly checkOutDate: string,
    public readonly guestCount: number,
    public readonly nights: number,
    public readonly errorMessage: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static fromDomain(payment: Payment): PaymentOutput {
    return new PaymentOutput(
      payment.id!,
      payment.amount,
      payment.currency,
      payment.status,
      payment.provider,
      payment.transactionId,
      payment.userId,
      payment.roomId,
      payment.reservationId,
      payment.cartId,
      payment.reservationIds,
      payment.checkInDate,
      payment.checkOutDate,
      payment.guestCount,
      payment.nights,
      payment.errorMessage,
      payment.createdAt!,
      payment.updatedAt!,
    );
  }
}
