export class ListMessagesQuery {
  constructor(
    public readonly authId: number,
    public readonly conversationId: number,
    public readonly since?: Date,
  ) {}
}
