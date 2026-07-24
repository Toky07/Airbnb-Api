import { ForbiddenException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { GetOrCreateConversationCommandHandler } from './GetOrCreateConversationCommandHandler';
import { GetOrCreateConversationCommand } from '../commands/GetOrCreateConversationCommand';
import { createSampleConversation } from '../messaging-test.helpers';

describe('GetOrCreateConversationCommandHandler', () => {
  it('returns an existing or newly created conversation', async () => {
    const conversation = createSampleConversation();
    const getOrCreateConversation = {
      execute: vi.fn().mockResolvedValue(conversation),
    };
    const resolveParticipants = {
      assertParticipant: vi.fn().mockResolvedValue({
        userId: 2,
        participants: { guestId: 2, hostId: 3 },
      }),
    };

    const handler = new GetOrCreateConversationCommandHandler(
      getOrCreateConversation as never,
      resolveParticipants as never,
    );

    const result = await handler.execute(
      new GetOrCreateConversationCommand(10, 1),
    );

    expect(result.id).toBe(1);
    expect(getOrCreateConversation.execute).toHaveBeenCalledWith(1);
  });

  it('rejects non-participants', async () => {
    const handler = new GetOrCreateConversationCommandHandler(
      { execute: vi.fn() } as never,
      {
        assertParticipant: vi.fn().mockRejectedValue(new ForbiddenException()),
      } as never,
    );

    await expect(
      handler.execute(new GetOrCreateConversationCommand(10, 1)),
    ).rejects.toThrow(ForbiddenException);
  });
});
