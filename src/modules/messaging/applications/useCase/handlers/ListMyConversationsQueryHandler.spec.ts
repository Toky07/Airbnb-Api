import { describe, expect, it, vi } from 'vitest';
import { ListMyConversationsQueryHandler } from './ListMyConversationsQueryHandler';
import { ListMyConversationsQuery } from '../queries/ListMyConversationsQuery';
import {
  createConversationRepositoryMock,
  createSampleConversation,
} from '../messaging-test.helpers';

describe('ListMyConversationsQueryHandler', () => {
  it('returns conversations for the authenticated user', async () => {
    const conversation = createSampleConversation();
    const conversationRepository = createConversationRepositoryMock({
      findByParticipantUserId: vi.fn().mockResolvedValue([conversation]),
    });
    const userRepository = {
      findByAuthId: vi.fn().mockResolvedValue({ id: 2 }),
    };

    const handler = new ListMyConversationsQueryHandler(
      conversationRepository,
      userRepository as never,
    );

    const result = await handler.execute(new ListMyConversationsQuery(10));

    expect(result).toHaveLength(1);
    expect(result[0]?.guestId).toBe(2);
    expect(conversationRepository.findByParticipantUserId).toHaveBeenCalledWith(2);
  });

  it('returns an empty list when the user is unknown', async () => {
    const handler = new ListMyConversationsQueryHandler(
      createConversationRepositoryMock(),
      { findByAuthId: vi.fn().mockResolvedValue(null) } as never,
    );

    const result = await handler.execute(new ListMyConversationsQuery(10));

    expect(result).toEqual([]);
  });
});
