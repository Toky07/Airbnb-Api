export type GetReservationAccess = {
  authId: number;
  canReadAll: boolean;
  canReadHost: boolean;
};

export class GetReservationQuery {
  constructor(
    public readonly id: number,
    public readonly access: GetReservationAccess,
  ) {}
}
