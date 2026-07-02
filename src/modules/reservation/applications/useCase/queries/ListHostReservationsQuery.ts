import type { ReservationListParams } from '../../../domain/repositories/reservation.repository';

export class ListHostReservationsQuery {
  constructor(
    public readonly authId: number,
    public readonly params: ReservationListParams,
  ) {}
}
