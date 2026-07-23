export class DeleteRoomBlockedDateCommand {
  constructor(
    public readonly roomId: number,
    public readonly blockedDateId: number,
  ) {}
}
