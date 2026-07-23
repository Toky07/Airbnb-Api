export class MarkReservationNoShowCommand {
  constructor(
    public readonly id: number,
    public readonly authId: number,
  ) {}
}
