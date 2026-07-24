export class Message {
  constructor(
    public readonly conversationId: number,
    public readonly senderId: number,
    public readonly body: string,
    public readonly id?: number,
    public readAt?: Date | null,
    public readonly createdAt?: Date,
  ) {}
}
