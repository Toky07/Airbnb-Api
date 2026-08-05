export const RESERVATION_EVENTS = {
  CONFIRMED: 'reservation.confirmed',
} as const;

export type ReservationEventName =
  (typeof RESERVATION_EVENTS)[keyof typeof RESERVATION_EVENTS];
