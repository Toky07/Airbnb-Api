export type GetBookingOrderAccess = {
  authId: number;
  canReadAll: boolean;
  canReadHost: boolean;
};

export class GetBookingOrderQuery {
  constructor(
    public readonly paymentId: number,
    public readonly access: GetBookingOrderAccess,
  ) {}
}
