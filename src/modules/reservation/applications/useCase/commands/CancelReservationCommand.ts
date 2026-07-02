export type CancelReservationAccess = {
  authId: number;
  canCancelAll: boolean;
  canCancelHost: boolean;
};

export class CancelReservationCommand {
  constructor(
    public readonly id: number,
    public readonly access: CancelReservationAccess,
  ) {}
}
