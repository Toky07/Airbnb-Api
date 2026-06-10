import { describe, expect, it } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { CalculateStayAmountService } from './calculate-stay-amount.service';

describe('CalculateStayAmountService', () => {
  const service = new CalculateStayAmountService();

  it('calcule le montant pour un séjour de deux nuits', () => {
    const result = service.execute({
      checkIn: '2026-06-10',
      checkOut: '2026-06-12',
      pricePerNight: 100,
    });

    expect(result.nights).toBe(2);
    expect(result.amountInMajorUnit).toBe(200);
    expect(result.amountInCents).toBe(20000);
  });

  it('rejette une date de départ antérieure ou égale à l’arrivée', () => {
    expect(() =>
      service.execute({
        checkIn: '2026-06-12',
        checkOut: '2026-06-10',
        pricePerNight: 100,
      }),
    ).toThrow(BadRequestException);
  });

  it('rejette un montant inférieur au minimum Stripe', () => {
    expect(() =>
      service.execute({
        checkIn: '2026-06-10',
        checkOut: '2026-06-11',
        pricePerNight: 0.1,
      }),
    ).toThrow(BadRequestException);
  });
});
