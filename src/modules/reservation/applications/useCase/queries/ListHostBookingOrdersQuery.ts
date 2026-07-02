import type { ReservationListParams } from '../../../domain/repositories/reservation.repository';

export class ListHostBookingOrdersQuery {
  constructor(
    public readonly authId: number,
    public readonly params: ReservationListParams,
  ) {}
}
