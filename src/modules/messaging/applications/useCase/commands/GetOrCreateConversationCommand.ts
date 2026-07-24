export class GetOrCreateConversationCommand {
  constructor(
    public readonly authId: number,
    public readonly reservationId: number,
  ) {}
}
