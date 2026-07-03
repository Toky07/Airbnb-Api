import { describe, expect, it } from 'vitest';
import {
  buildReservationActivityLabel,
  computeOccupancyRate,
} from './reservation-stats.utils';

describe('reservation-stats.utils', () => {
  it('calcule le taux d’occupation', () => {
    expect(computeOccupancyRate(15, 2, 30)).toBe(25);
    expect(computeOccupancyRate(0, 0, 30)).toBe(0);
  });

  it('construit le libellé d’activité', () => {
    expect(
      buildReservationActivityLabel({
        id: 3,
        roomName: 'Suite',
        propertyName: 'Hôtel Azur',
      } as never),
    ).toBe('Suite — Hôtel Azur');
  });
});
