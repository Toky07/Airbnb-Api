import type { Conversation } from '../../domain/entities/conversation.entity';

export class ConversationOutput {
  constructor(
    public readonly id: number,
    public readonly guestId: number,
    public readonly hostId: number,
    public readonly reservationId: number,
    public readonly lastMessageAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static fromDomain(conversation: Conversation): ConversationOutput {
    return new ConversationOutput(
      conversation.id!,
      conversation.guestId,
      conversation.hostId,
      conversation.reservationId,
      conversation.lastMessageAt ?? null,
      conversation.createdAt!,
      conversation.updatedAt!,
    );
  }
}
