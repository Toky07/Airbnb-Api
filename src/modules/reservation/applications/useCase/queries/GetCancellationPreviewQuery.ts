import type { ReservationAccess } from '../../services/assert-reservation-access.service';

export class GetCancellationPreviewQuery {
  constructor(
    public readonly id: number,
    public readonly access: ReservationAccess,
  ) {}
}
