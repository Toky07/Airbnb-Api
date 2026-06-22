import type { PaymentProvider } from '../../domain/constants/payment-provider.constant';
import type { PaymentStatus } from '../../domain/constants/payment-status.constant';
import type { Payment } from '../../domain/entities/payment.entity';
import type { PaymentType } from '../../domain/types/payment.type';

export class PaymentOutput {
  constructor(
    public readonly id: number,
    public readonly amount: number,
    public readonly currency: string,
    public readonly status: PaymentStatus,
    public readonly provider: PaymentProvider,
    public readonly transactionId: string | null,
    public readonly userId: number,
    public readonly propertyType: PaymentType,
    public readonly propertyId: number,
    public readonly cartId: number | null,
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
      payment.propertyType,
      payment.propertyId,
      payment.cartId,
      payment.errorMessage,
      payment.createdAt!,
      payment.updatedAt!,
    );
  }
}
