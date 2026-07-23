import { describe, expect, it } from 'vitest';
import {
  RESERVATION_HOLD_DURATION_MS,
  computeReservationHoldUntil,
} from './reservation-hold.constant';

describe('reservation hold constants', () => {
  it('calcule holdUntil 20 minutes après maintenant', () => {
    const from = new Date('2026-07-01T10:00:00.000Z');
    const holdUntil = computeReservationHoldUntil(from);
    expect(holdUntil.getTime() - from.getTime()).toBe(
      RESERVATION_HOLD_DURATION_MS,
    );
  });
});
