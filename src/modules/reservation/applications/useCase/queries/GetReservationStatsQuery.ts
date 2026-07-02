export type ReservationStatsAccess = {
  canReadAll: boolean;
  canReadHost: boolean;
};

export class GetReservationStatsQuery {
  constructor(
    public readonly authId: number,
    public readonly access: ReservationStatsAccess,
  ) {}
}
