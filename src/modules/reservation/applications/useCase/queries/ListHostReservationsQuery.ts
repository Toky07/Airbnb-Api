import type { ReservationListParams } from '@src/modules/reservation/domain/repositories/reservation.repository';

export class ListHostReservationsQuery {
  constructor(
    public readonly authId: number,
    public readonly params: ReservationListParams,
  ) {}
}
