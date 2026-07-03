import { BadRequestException, Injectable } from '@nestjs/common';

export type StayAmountInput = {
  checkIn: string;
  checkOut: string;
  pricePerNight: number;
};

export type StayAmountResult = {
  nights: number;
  amountInCents: number;
  amountInMajorUnit: number;
};

@Injectable()
export class CalculateStayAmountService {
  execute(input: StayAmountInput): StayAmountResult {
    const checkIn = this.parseDate(input.checkIn, 'checkIn');
    const checkOut = this.parseDate(input.checkOut, 'checkOut');

    if (checkOut <= checkIn) {
      throw new BadRequestException(
        'La date de départ doit être postérieure à la date d’arrivée.',
      );
    }

    const nights = this.countNights(checkIn, checkOut);
    if (nights < 1) {
      throw new BadRequestException('Le séjour doit durer au moins une nuit.');
    }

    if (input.pricePerNight <= 0) {
      throw new BadRequestException('Le prix par nuit est invalide.');
    }

    const amountInMajorUnit = Number((nights * input.pricePerNight).toFixed(2));
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
    };
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

  private countNights(checkIn: Date, checkOut: Date): number {
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    return Math.round(
      (checkOut.getTime() - checkIn.getTime()) / millisecondsPerDay,
    );
  }
}
