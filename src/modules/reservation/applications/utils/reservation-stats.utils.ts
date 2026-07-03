import type { ReservationItemOutput } from '../dto/reservation-item.output';

export function computeOccupancyRate(
  confirmedNights: number,
  roomCount: number,
  daysInMonth: number,
): number {
  const maxNights = roomCount * daysInMonth;
  if (maxNights <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((confirmedNights / maxNights) * 100));
}

export function buildReservationActivityLabel(item: ReservationItemOutput): string {
  if (item.roomName && item.propertyName) {
    return `${item.roomName} — ${item.propertyName}`;
  }

  return `Séjour #${item.id}`;
}
