export const RESERVATION_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
} as const;

export type ReservationStatus =
  (typeof RESERVATION_STATUS)[keyof typeof RESERVATION_STATUS];

export const BLOCKING_RESERVATION_STATUSES: ReservationStatus[] = [
  RESERVATION_STATUS.PENDING,
  RESERVATION_STATUS.CONFIRMED,
];
