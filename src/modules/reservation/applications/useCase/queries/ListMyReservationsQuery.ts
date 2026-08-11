import type { ReservationListParams } from '@src/modules/reservation/domain/repositories/reservation.repository';

export class ListMyReservationsQuery {
  constructor(
    public readonly authId: number,
    public readonly params: ReservationListParams,
  ) {}
}
