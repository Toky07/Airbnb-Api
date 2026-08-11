import type { ReservationListParams } from '@src/modules/reservation/domain/repositories/reservation.repository';

export class ListReservationsQuery {
  constructor(public readonly params: ReservationListParams) {}
}
