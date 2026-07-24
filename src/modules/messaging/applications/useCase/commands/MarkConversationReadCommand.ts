export class MarkConversationReadCommand {
  constructor(
    public readonly authId: number,
    public readonly conversationId: number,
  ) {}
}
