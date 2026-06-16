import type { PaymentProvider } from '../constants/payment-provider.constant';
import type { PaymentStatus } from '../constants/payment-status.constant';
import { PaymentType } from '../types/payment.type';

export class Payment {
  constructor(
    public readonly amount: number,
    public readonly currency: string,
    public status: PaymentStatus,
    public readonly provider: PaymentProvider,
    public readonly transactionId: string,
    public readonly userId: number,
    public readonly propertyType: PaymentType,
    public readonly propertyId: number,
    public readonly cartId: number | null = null,
    public readonly errorMessage: string | null = null,
    public readonly id?: number,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
    public readonly invoiceNotificationsSentAt: Date | null = null,
  ) {}
}
