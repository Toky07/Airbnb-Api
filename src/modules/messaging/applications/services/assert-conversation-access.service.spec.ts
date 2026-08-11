import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { AssertConversationAccessService } from './assert-conversation-access.service';
import type { IConversationRepository } from '../../domain/repositories/conversation.repository';
import type { IUserRepository } from '../../../user/contracts';

describe('AssertConversationAccessService', () => {
  it('returns conversation when it exists', async () => {
    const conversation = { id: 1, guestId: 2, hostId: 3 };
    const service = new AssertConversationAccessService(
      {
        findById: vi.fn().mockResolvedValue(conversation),
      } as unknown as IConversationRepository,
      {} as IUserRepository,
    );

    await expect(service.requireConversation(1)).resolves.toBe(conversation);
  });

  it('throws when conversation is missing', async () => {
    const service = new AssertConversationAccessService(
      {
        findById: vi.fn().mockResolvedValue(null),
      } as unknown as IConversationRepository,
      {} as IUserRepository,
    );

    await expect(service.requireConversation(1)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('returns user id when participant can access conversation', async () => {
    const conversation = { id: 1, guestId: 2, hostId: 3 };
    const service = new AssertConversationAccessService(
      {} as unknown as IConversationRepository,
      {
        findByAuthId: vi.fn().mockResolvedValue({ id: 2 }),
      } as unknown as IUserRepository,
    );

    await expect(service.assertCanAccess(conversation, 99)).resolves.toBe(2);
  });

  it('throws when user is not a participant', async () => {
    const conversation = { id: 1, guestId: 2, hostId: 3 };
    const service = new AssertConversationAccessService(
      {} as unknown as IConversationRepository,
      {
        findByAuthId: vi.fn().mockResolvedValue({ id: 9 }),
      } as unknown as IUserRepository,
    );

    await expect(
      service.assertCanAccess(conversation, 99),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
