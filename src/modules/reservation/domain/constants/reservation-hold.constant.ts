export const RESERVATION_HOLD_DURATION_MS = 20 * 60 * 1000;

export function computeReservationHoldUntil(from: Date = new Date()): Date {
  return new Date(from.getTime() + RESERVATION_HOLD_DURATION_MS);
}
