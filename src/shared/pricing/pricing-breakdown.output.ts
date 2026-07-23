import type { PricingBreakdown } from './pricing-breakdown.types';

export class PricingBreakdownOutput {
  constructor(
    public readonly subtotalCents: number,
    public readonly vatCents: number,
    public readonly touristTaxCents: number,
    public readonly serviceFeeCents: number,
    public readonly totalCents: number,
  ) {}

  static fromDomain(breakdown: PricingBreakdown): PricingBreakdownOutput {
    return new PricingBreakdownOutput(
      breakdown.subtotalCents,
      breakdown.vatCents,
      breakdown.touristTaxCents,
      breakdown.serviceFeeCents,
      breakdown.totalCents,
    );
  }
}
