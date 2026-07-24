export class SendMessageCommand {
  constructor(
    public readonly authId: number,
    public readonly conversationId: number,
    public readonly body: string,
  ) {}
}
