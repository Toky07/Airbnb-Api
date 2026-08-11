import type { Message } from '@src/modules/messaging/domain/entities/message.entity';

export const MESSAGE_REPOSITORY = 'MESSAGE_REPOSITORY';

export interface IMessageRepository {
  create(message: Message): Promise<Message>;
  findByConversationId(
    conversationId: number,
    since?: Date,
  ): Promise<Message[]>;
  markAsRead(conversationId: number, readerId: number): Promise<void>;
}
