import type { ReservationListParams } from '../../../domain/repositories/reservation.repository';

export class ListMyReservationsQuery {
  constructor(
    public readonly authId: number,
    public readonly params: ReservationListParams,
  ) {}
}
