import type { Conversation } from '@src/modules/messaging/domain/entities/conversation.entity';

export const CONVERSATION_REPOSITORY = 'CONVERSATION_REPOSITORY';

export interface IConversationRepository {
  create(conversation: Conversation): Promise<Conversation>;
  findById(id: number): Promise<Conversation | null>;
  findByReservationId(reservationId: number): Promise<Conversation | null>;
  findByParticipantUserId(userId: number): Promise<Conversation[]>;
  updateLastMessageAt(id: number, lastMessageAt: Date): Promise<void>;
}
