import type { ReservationListParams } from '@src/modules/reservation/domain/repositories/reservation.repository';

export class ListBookingOrdersQuery {
  constructor(public readonly params: ReservationListParams) {}
}
