export const RESERVATION_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
} as const;

export type ReservationStatus =
  (typeof RESERVATION_STATUS)[keyof typeof RESERVATION_STATUS];

export const BLOCKING_RESERVATION_STATUSES: ReservationStatus[] = [
  RESERVATION_STATUS.PENDING,
  RESERVATION_STATUS.CONFIRMED,
];
