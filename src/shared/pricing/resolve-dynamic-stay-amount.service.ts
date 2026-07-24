import { BadRequestException, Injectable } from '@nestjs/common';
import type { StayAmountResult } from './calculate-stay-amount.service';

export type RateOverrideSlice = {
  startDate: string;
  endDate: string;
  pricePerNight: number;
};

export type DynamicStayPricingInput = {
  checkIn: string;
  checkOut: string;
  pricePerNight: number;
  weekendPricePerNight?: number | null;
  rateOverrides?: RateOverrideSlice[];
};

export type DynamicStayPricingResult = StayAmountResult & {
  averagePricePerNight: number;
  nightlyRates: Array<{ date: string; pricePerNight: number }>;
};

const WEEKEND_DAYS_UTC = new Set([0, 5, 6]);

@Injectable()
export class ResolveDynamicStayAmountService {
  resolve(input: DynamicStayPricingInput): DynamicStayPricingResult {
    const checkIn = this.parseDate(input.checkIn, 'checkIn');
    const checkOut = this.parseDate(input.checkOut, 'checkOut');

    if (checkOut <= checkIn) {
      throw new BadRequestException(
        'La date de départ doit être postérieure à la date d’arrivée.',
      );
    }

    if (input.pricePerNight <= 0) {
      throw new BadRequestException('Le prix par nuit est invalide.');
    }

    const nightlyRates = this.buildNightlyRates(input, checkIn, checkOut);
    const nights = nightlyRates.length;

    if (nights < 1) {
      throw new BadRequestException('Le séjour doit durer au moins une nuit.');
    }

    const amountInMajorUnit = Number(
      nightlyRates
        .reduce((sum, night) => sum + night.pricePerNight, 0)
        .toFixed(2),
    );
    const amountInCents = Math.round(amountInMajorUnit * 100);

    if (amountInCents < 50) {
      throw new BadRequestException(
        'Le montant minimum pour un paiement Stripe est de 0,50.',
      );
    }

    return {
      nights,
      amountInCents,
      amountInMajorUnit,
      averagePricePerNight: Number((amountInMajorUnit / nights).toFixed(2)),
      nightlyRates,
    };
  }

  private buildNightlyRates(
    input: DynamicStayPricingInput,
    checkIn: Date,
    checkOut: Date,
  ) {
    const nightlyRates: Array<{ date: string; pricePerNight: number }> = [];
    const current = new Date(checkIn);

    while (current < checkOut) {
      const date = this.formatDate(current);
      nightlyRates.push({
        date,
        pricePerNight: this.resolveNightPrice(date, input),
      });
      current.setUTCDate(current.getUTCDate() + 1);
    }

    return nightlyRates;
  }

  private resolveNightPrice(
    nightDate: string,
    input: DynamicStayPricingInput,
  ): number {
    const override = (input.rateOverrides ?? []).find(
      (slice) => slice.startDate <= nightDate && slice.endDate > nightDate,
    );
    if (override) {
      return override.pricePerNight;
    }

    const day = this.parseDate(nightDate, 'nightDate').getUTCDay();
    if (
      input.weekendPricePerNight != null &&
      input.weekendPricePerNight > 0 &&
      WEEKEND_DAYS_UTC.has(day)
    ) {
      return input.weekendPricePerNight;
    }

    return input.pricePerNight;
  }

  private parseDate(value: string, field: string): Date {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException(`La date ${field} est invalide.`);
    }

    return new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
    );
  }

  private formatDate(date: Date): string {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
