import type { ReservationListParams } from '../../../domain/repositories/reservation.repository';

export class ListReservationsQuery {
  constructor(public readonly params: ReservationListParams) {}
}
