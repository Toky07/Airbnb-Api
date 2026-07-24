import { ForbiddenException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { MarkConversationReadCommandHandler } from './MarkConversationReadCommandHandler';
import { MarkConversationReadCommand } from '../commands/MarkConversationReadCommand';
import {
  createMessageRepositoryMock,
  createSampleConversation,
} from '../messaging-test.helpers';

describe('MarkConversationReadCommandHandler', () => {
  it('marks unread messages as read for the current participant', async () => {
    const conversation = createSampleConversation();
    const messageRepository = createMessageRepositoryMock();
    const assertConversationAccess = {
      requireConversation: vi.fn().mockResolvedValue(conversation),
      assertCanAccess: vi.fn().mockResolvedValue(2),
    };

    const handler = new MarkConversationReadCommandHandler(
      messageRepository,
      assertConversationAccess as never,
    );

    await handler.execute(new MarkConversationReadCommand(10, 1));

    expect(messageRepository.markAsRead).toHaveBeenCalledWith(1, 2);
  });

  it('propagates access errors', async () => {
    const handler = new MarkConversationReadCommandHandler(
      createMessageRepositoryMock(),
      {
        requireConversation: vi.fn().mockRejectedValue(new ForbiddenException()),
        assertCanAccess: vi.fn(),
      } as never,
    );

    await expect(
      handler.execute(new MarkConversationReadCommand(10, 1)),
    ).rejects.toThrow(ForbiddenException);
  });
});
