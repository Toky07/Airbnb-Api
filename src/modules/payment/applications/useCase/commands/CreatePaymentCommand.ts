import { PaymentProvider } from '@src/modules/payment/domain/constants/payment-provider.constant';
import { PaymentType } from '@src/modules/payment/domain/types/payment.type';
import type { PricingBreakdown } from '@src/shared/pricing/pricing-breakdown.types';

export class CreatePaymentCommand {
  constructor(
    public readonly amount: number,
    public readonly currency: string,
    public readonly provider: PaymentProvider,
    public readonly userId: number,
    public readonly propertyType: PaymentType,
    public readonly propertyId: number,
    public readonly cartId: number | null = null,
    public readonly pricingBreakdown: PricingBreakdown | null = null,
  ) {}
}
