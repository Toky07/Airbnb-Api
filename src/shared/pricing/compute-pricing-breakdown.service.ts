import { BadRequestException, Injectable } from '@nestjs/common';
import { getServiceFeePercent, getVatRate } from './pricing.constants';
import type {
  PricingBreakdown,
  PricingBreakdownLine,
  PricingLineInput,
} from './pricing-breakdown.types';
import { CalculateStayAmountService } from './calculate-stay-amount.service';

@Injectable()
export class ComputePricingBreakdownService {
  constructor(
    private readonly calculateStayAmount: CalculateStayAmountService,
  ) {}

  execute(lines: PricingLineInput[]): PricingBreakdown {
    if (lines.length === 0) {
      throw new BadRequestException('Au moins une ligne de tarification est requise.');
    }

    const vatRate = getVatRate();
    const serviceFeePercent = getServiceFeePercent();
    const computedLines = lines.map((line) =>
      this.computeLine(line, vatRate, serviceFeePercent),
    );

    return this.aggregate(computedLines);
  }

  private computeLine(
    line: PricingLineInput,
    vatRate: number,
    serviceFeePercent: number,
  ): PricingBreakdownLine {
    const stay = this.calculateStayAmount.execute({
      checkIn: line.checkIn,
      checkOut: line.checkOut,
      pricePerNight: line.pricePerNight,
    });

    const subtotalCents = stay.amountInCents;
    const vatCents = Math.round(subtotalCents * vatRate);
    const touristTaxCents = Math.round(
      line.guestCount * stay.nights * line.touristTaxPerGuestNight * 100,
    );
    const serviceFeeCents = Math.round(subtotalCents * serviceFeePercent);

    return {
      roomId: line.roomId,
      propertyId: line.propertyId ?? null,
      subtotalCents,
      vatCents,
      touristTaxCents,
      serviceFeeCents,
      totalCents: subtotalCents + vatCents + touristTaxCents + serviceFeeCents,
    };
  }

  private aggregate(lines: PricingBreakdownLine[]): PricingBreakdown {
    return lines.reduce<PricingBreakdown>(
      (totals, line) => ({
        subtotalCents: totals.subtotalCents + line.subtotalCents,
        vatCents: totals.vatCents + line.vatCents,
        touristTaxCents: totals.touristTaxCents + line.touristTaxCents,
        serviceFeeCents: totals.serviceFeeCents + line.serviceFeeCents,
        totalCents: totals.totalCents + line.totalCents,
        lines: [...totals.lines, line],
      }),
      {
        subtotalCents: 0,
        vatCents: 0,
        touristTaxCents: 0,
        serviceFeeCents: 0,
        totalCents: 0,
        lines: [],
      },
    );
  }
}
