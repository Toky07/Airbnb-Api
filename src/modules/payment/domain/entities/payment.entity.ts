import type { PaymentProvider } from '@src/modules/payment/domain/constants/payment-provider.constant';
import type { PaymentStatus } from '@src/modules/payment/domain/constants/payment-status.constant';
import { PaymentType } from '@src/modules/payment/domain/types/payment.type';
import { PAYMENT_STATUS } from '@src/modules/payment/domain/constants/payment-status.constant';

import type { PricingBreakdown } from '@src/shared/pricing/pricing-breakdown.types';

export type CreatePaymentParams = {
  amount: number;
  currency: string;
  provider: PaymentProvider;
  userId: number;
  propertyType: PaymentType;
  propertyId: number;
  status?: PaymentStatus;
  cartId?: number | null;
  transactionId?: string | null;
  errorMessage?: string | null;
  refundedAmount?: number;
  refundTransactionId?: string | null;
  pricingBreakdown?: PricingBreakdown | null;
  hostUserId?: number | null;
  stripeAccountId?: string | null;
  applicationFeeAmount?: number | null;
  id?: number;
  createdAt?: Date;
  updatedAt?: Date;
  invoiceNotificationsSentAt?: Date | null;
};

export class Payment {
  constructor(
    public readonly amount: number,
    public readonly currency: string,
    public readonly provider: PaymentProvider,
    public readonly userId: number,
    public readonly propertyType: PaymentType,
    public readonly propertyId: number,
    public status: PaymentStatus = PAYMENT_STATUS.PENDING,
    public readonly cartId: number | null = null,
    public readonly transactionId: string | null = null,
    public readonly id?: number,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
    public readonly invoiceNotificationsSentAt: Date | null = null,
    public readonly errorMessage: string | null = null,
    public readonly refundedAmount: number = 0,
    public readonly refundTransactionId: string | null = null,
    public readonly pricingBreakdown: PricingBreakdown | null = null,
    public readonly hostUserId: number | null = null,
    public readonly stripeAccountId: string | null = null,
    public readonly applicationFeeAmount: number | null = null,
  ) {}

  confirm(): void {
    this.status = PAYMENT_STATUS.SUCCEEDED;
  }

  cancel(): void {
    this.status = PAYMENT_STATUS.CANCELED;
  }

  static create(params: CreatePaymentParams): Payment {
    return new Payment(
      params.amount,
      params.currency,
      params.provider,
      params.userId,
      params.propertyType,
      params.propertyId,
      params.status,
      params.cartId,
      params.transactionId,
      params.id,
      params.createdAt,
      params.updatedAt,
      params.invoiceNotificationsSentAt,
      params.errorMessage,
      params.refundedAmount ?? 0,
      params.refundTransactionId ?? null,
      params.pricingBreakdown ?? null,
      params.hostUserId ?? null,
      params.stripeAccountId ?? null,
      params.applicationFeeAmount ?? null,
    );
  }
}
