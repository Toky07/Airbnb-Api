import type { PaymentProvider } from '../constants/payment-provider.constant';
import type { PaymentStatus } from '../constants/payment-status.constant';

export class Payment {
  constructor(
    public readonly amount: number,
    public readonly currency: string,
    public readonly status: PaymentStatus,
    public readonly provider: PaymentProvider,
    public readonly transactionId: string,
    public readonly userId: number,
    public readonly roomId: number,
    public readonly checkInDate: string,
    public readonly checkOutDate: string,
    public readonly guestCount: number,
    public readonly nights: number,
    public readonly reservationId: number | null = null,
    public readonly cartId: number | null = null,
    public readonly reservationIds: number[] = [],
    public readonly errorMessage: string | null = null,
    public readonly id?: number,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}
}
