import type { ReservationListParams } from '../../../domain/repositories/reservation.repository';

export class ListBookingOrdersQuery {
  constructor(public readonly params: ReservationListParams) {}
}
