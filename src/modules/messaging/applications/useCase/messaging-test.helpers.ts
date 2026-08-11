import { vi } from 'vitest';
import { Conversation } from '@src/modules/messaging/domain/entities/conversation.entity';
import { Message } from '@src/modules/messaging/domain/entities/message.entity';
import type { IConversationRepository } from '@src/modules/messaging/domain/repositories/conversation.repository';
import type { IMessageRepository } from '@src/modules/messaging/domain/repositories/message.repository';

export function createSampleConversation(
  overrides: Partial<{
    id: number;
    guestId: number;
    hostId: number;
    reservationId: number;
    lastMessageAt: Date | null;
  }> = {},
): Conversation {
  return new Conversation(
    overrides.guestId ?? 2,
    overrides.hostId ?? 3,
    overrides.reservationId ?? 1,
    overrides.id ?? 1,
    overrides.lastMessageAt ?? null,
    new Date('2026-01-01T10:00:00.000Z'),
    new Date('2026-01-01T10:00:00.000Z'),
  );
}

export function createSampleMessage(
  overrides: Partial<{
    id: number;
    conversationId: number;
    senderId: number;
    body: string;
    readAt: Date | null;
  }> = {},
): Message {
  return new Message(
    overrides.conversationId ?? 1,
    overrides.senderId ?? 2,
    overrides.body ?? 'Bonjour',
    overrides.id ?? 1,
    overrides.readAt ?? null,
    new Date('2026-01-01T10:00:00.000Z'),
  );
}

export function createConversationRepositoryMock(
  overrides: Partial<IConversationRepository> = {},
): IConversationRepository {
  return {
    create: vi.fn().mockImplementation(async (conversation: Conversation) =>
      createSampleConversation({
        guestId: conversation.guestId,
        hostId: conversation.hostId,
        reservationId: conversation.reservationId,
      }),
    ),
    findById: vi.fn(),
    findByReservationId: vi.fn(),
    findByParticipantUserId: vi.fn().mockResolvedValue([]),
    updateLastMessageAt: vi.fn(),
    ...overrides,
  };
}

export function createMessageRepositoryMock(
  overrides: Partial<IMessageRepository> = {},
): IMessageRepository {
  return {
    create: vi.fn().mockImplementation(async (message: Message) =>
      createSampleMessage({
        conversationId: message.conversationId,
        senderId: message.senderId,
        body: message.body,
      }),
    ),
    findByConversationId: vi.fn().mockResolvedValue([]),
    markAsRead: vi.fn(),
    ...overrides,
  };
}
