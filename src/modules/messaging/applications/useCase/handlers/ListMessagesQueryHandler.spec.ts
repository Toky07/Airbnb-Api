import { ForbiddenException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { ListMessagesQueryHandler } from './ListMessagesQueryHandler';
import { ListMessagesQuery } from '@src/modules/messaging/applications/useCase/queries/ListMessagesQuery';
import {
  createMessageRepositoryMock,
  createSampleConversation,
  createSampleMessage,
} from '@src/modules/messaging/applications/useCase/messaging-test.helpers';

describe('ListMessagesQueryHandler', () => {
  it('returns messages for an authorized participant', async () => {
    const conversation = createSampleConversation();
    const message = createSampleMessage();
    const messageRepository = createMessageRepositoryMock({
      findByConversationId: vi.fn().mockResolvedValue([message]),
    });
    const assertConversationAccess = {
      requireConversation: vi.fn().mockResolvedValue(conversation),
      assertCanAccess: vi.fn().mockResolvedValue(2),
    };

    const handler = new ListMessagesQueryHandler(
      messageRepository,
      assertConversationAccess as never,
    );

    const result = await handler.execute(
      new ListMessagesQuery(10, 1, new Date('2026-01-01T00:00:00.000Z')),
    );

    expect(result).toHaveLength(1);
    expect(result[0]?.body).toBe('Bonjour');
    expect(messageRepository.findByConversationId).toHaveBeenCalledWith(
      1,
      new Date('2026-01-01T00:00:00.000Z'),
    );
  });

  it('propagates access errors', async () => {
    const handler = new ListMessagesQueryHandler(
      createMessageRepositoryMock(),
      {
        requireConversation: vi
          .fn()
          .mockRejectedValue(new ForbiddenException()),
        assertCanAccess: vi.fn(),
      } as never,
    );

    await expect(handler.execute(new ListMessagesQuery(10, 1))).rejects.toThrow(
      ForbiddenException,
    );
  });
});
