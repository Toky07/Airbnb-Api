import { ReservationOutput } from './reservation.output';

export class CancelReservationOutput {
  constructor(
    public readonly reservation: ReservationOutput,
    public readonly refundAmount: number,
    public readonly refundPercent: number,
    public readonly policyLabel: string,
  ) {}
}
