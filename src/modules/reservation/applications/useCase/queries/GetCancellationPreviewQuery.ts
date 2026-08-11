import type { ReservationAccess } from '@src/modules/reservation/applications/services/assert-reservation-access.service';

export class GetCancellationPreviewQuery {
  constructor(
    public readonly id: number,
    public readonly access: ReservationAccess,
  ) {}
}
