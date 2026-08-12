export class ReservationActivityOutput {
  constructor(
    public readonly id: number,
    public readonly label: string,
    public readonly totalPrice: number,
    public readonly createdAt: Date,
    public readonly status: string,
  ) {}
}
