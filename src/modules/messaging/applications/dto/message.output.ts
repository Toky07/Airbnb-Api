import type { Message } from '@src/modules/messaging/domain/entities/message.entity';

export class MessageOutput {
  constructor(
    public readonly id: number,
    public readonly conversationId: number,
    public readonly senderId: number,
    public readonly body: string,
    public readonly readAt: Date | null,
    public readonly createdAt: Date,
  ) {}

  static fromDomain(message: Message): MessageOutput {
    return new MessageOutput(
      message.id!,
      message.conversationId,
      message.senderId,
      message.body,
      message.readAt ?? null,
      message.createdAt!,
    );
  }
}
