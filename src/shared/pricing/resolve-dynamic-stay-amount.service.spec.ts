import { describe, expect, it } from 'vitest';
import { ResolveDynamicStayAmountService } from './resolve-dynamic-stay-amount.service';

describe('ResolveDynamicStayAmountService', () => {
  const service = new ResolveDynamicStayAmountService();

  it('utilise le tarif de base sans règle dynamique', () => {
    const result = service.resolve({
      checkIn: '2026-08-03',
      checkOut: '2026-08-06',
      pricePerNight: 100,
    });

    expect(result.nights).toBe(3);
    expect(result.amountInMajorUnit).toBe(300);
    expect(result.averagePricePerNight).toBe(100);
  });

  it('applique le tarif week-end vendredi, samedi et dimanche', () => {
    const result = service.resolve({
      checkIn: '2026-08-07',
      checkOut: '2026-08-11',
      pricePerNight: 100,
      weekendPricePerNight: 150,
    });

    expect(result.nightlyRates.map((night) => night.pricePerNight)).toEqual([
      150,
      150,
      150,
      100,
    ]);
    expect(result.amountInMajorUnit).toBe(550);
  });

  it('priorise une surcharge saisonnière sur le week-end', () => {
    const result = service.resolve({
      checkIn: '2026-07-03',
      checkOut: '2026-07-06',
      pricePerNight: 100,
      weekendPricePerNight: 150,
      rateOverrides: [
        {
          startDate: '2026-07-01',
          endDate: '2026-08-01',
          pricePerNight: 200,
        },
      ],
    });

    expect(result.nightlyRates.every((night) => night.pricePerNight === 200)).toBe(
      true,
    );
    expect(result.amountInMajorUnit).toBe(600);
  });

  it('additionne des tarifs différents sur plusieurs nuits', () => {
    const result = service.resolve({
      checkIn: '2026-08-01',
      checkOut: '2026-08-04',
      pricePerNight: 80,
      rateOverrides: [
        {
          startDate: '2026-08-02',
          endDate: '2026-08-03',
          pricePerNight: 120,
        },
      ],
    });

    expect(result.nightlyRates.map((night) => night.pricePerNight)).toEqual([
      80,
      120,
      80,
    ]);
    expect(result.amountInMajorUnit).toBe(280);
  });
});
