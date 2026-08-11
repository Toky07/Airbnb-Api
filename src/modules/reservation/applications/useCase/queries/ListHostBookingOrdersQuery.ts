import type { ReservationListParams } from '@src/modules/reservation/domain/repositories/reservation.repository';

export class ListHostBookingOrdersQuery {
  constructor(
    public readonly authId: number,
    public readonly params: ReservationListParams,
  ) {}
}
