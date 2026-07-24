import type { PricingBreakdownOutput } from './pricing-breakdown.output';

export class CreatePaymentIntentOutput {
  constructor(
    public readonly paymentId: number,
    public readonly clientSecret: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly publishableKey: string,
    public readonly holdUntil: string | null = null,
    public readonly pricingBreakdown: PricingBreakdownOutput | null = null,
  ) {}
}
