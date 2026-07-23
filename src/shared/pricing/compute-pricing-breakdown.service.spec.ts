import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ComputePricingBreakdownService } from './compute-pricing-breakdown.service';
import { CalculateStayAmountService } from './calculate-stay-amount.service';

describe('ComputePricingBreakdownService', () => {
  let service: ComputePricingBreakdownService;

  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.stubEnv('VAT_RATE', '0.10');
    vi.stubEnv('SERVICE_FEE_PERCENT', '0.05');
    service = new ComputePricingBreakdownService(new CalculateStayAmountService());
  });

  it('calcule TVA et frais de service sans taxe de séjour', () => {
    const breakdown = service.execute([
      {
        checkIn: '2026-08-01',
        checkOut: '2026-08-03',
        pricePerNight: 100,
        guestCount: 2,
        touristTaxPerGuestNight: 0,
        roomId: 1,
        propertyId: 3,
      },
    ]);

    expect(breakdown.subtotalCents).toBe(20_000);
    expect(breakdown.vatCents).toBe(2_000);
    expect(breakdown.touristTaxCents).toBe(0);
    expect(breakdown.serviceFeeCents).toBe(1_000);
    expect(breakdown.totalCents).toBe(23_000);
  });

  it('inclut la taxe de séjour par personne et par nuit', () => {
    const breakdown = service.execute([
      {
        checkIn: '2026-08-01',
        checkOut: '2026-08-04',
        pricePerNight: 50,
        guestCount: 2,
        touristTaxPerGuestNight: 1.5,
        roomId: 2,
        propertyId: 4,
      },
    ]);

    expect(breakdown.subtotalCents).toBe(15_000);
    expect(breakdown.touristTaxCents).toBe(900);
    expect(breakdown.totalCents).toBe(
      breakdown.subtotalCents +
        breakdown.vatCents +
        breakdown.touristTaxCents +
        breakdown.serviceFeeCents,
    );
  });

  it('agrège plusieurs lignes panier', () => {
    const breakdown = service.execute([
      {
        checkIn: '2026-08-01',
        checkOut: '2026-08-02',
        pricePerNight: 100,
        guestCount: 1,
        touristTaxPerGuestNight: 0,
      },
      {
        checkIn: '2026-08-05',
        checkOut: '2026-08-07',
        pricePerNight: 80,
        guestCount: 2,
        touristTaxPerGuestNight: 1,
      },
    ]);

    expect(breakdown.lines).toHaveLength(2);
    expect(breakdown.subtotalCents).toBe(26_000);
    expect(breakdown.totalCents).toBeGreaterThan(breakdown.subtotalCents);
  });
});
