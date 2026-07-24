import { ForbiddenException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { SendMessageCommandHandler } from './SendMessageCommandHandler';
import { SendMessageCommand } from '../commands/SendMessageCommand';
import {
  createConversationRepositoryMock,
  createMessageRepositoryMock,
  createSampleConversation,
} from '../messaging-test.helpers';

describe('SendMessageCommandHandler', () => {
  it('sends a message and updates lastMessageAt', async () => {
    const conversation = createSampleConversation();
    const conversationRepository = createConversationRepositoryMock({
      findById: vi.fn().mockResolvedValue(conversation),
    });
    const messageRepository = createMessageRepositoryMock();
    const assertConversationAccess = {
      requireConversation: vi.fn().mockResolvedValue(conversation),
      assertCanAccess: vi.fn().mockResolvedValue(2),
    };

    const handler = new SendMessageCommandHandler(
      conversationRepository,
      messageRepository,
      assertConversationAccess as never,
    );

    const result = await handler.execute(
      new SendMessageCommand(10, 1, '  Bonjour  '),
    );

    expect(result.body).toBe('Bonjour');
    expect(messageRepository.create).toHaveBeenCalled();
    expect(conversationRepository.updateLastMessageAt).toHaveBeenCalledWith(
      1,
      expect.any(Date),
    );
  });

  it('propagates access errors', async () => {
    const handler = new SendMessageCommandHandler(
      createConversationRepositoryMock(),
      createMessageRepositoryMock(),
      {
        requireConversation: vi
          .fn()
          .mockRejectedValue(new ForbiddenException()),
        assertCanAccess: vi.fn(),
      } as never,
    );

    await expect(
      handler.execute(new SendMessageCommand(10, 1, 'Hello')),
    ).rejects.toThrow(ForbiddenException);
  });
});
