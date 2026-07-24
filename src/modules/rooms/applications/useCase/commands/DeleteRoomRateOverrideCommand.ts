export class DeleteRoomRateOverrideCommand {
  constructor(
    public readonly roomId: number,
    public readonly rateOverrideId: number,
  ) {}
}
