import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { RemoveFavoriteCommandHandler } from './RemoveFavoriteCommandHandler';
import { RemoveFavoriteCommand } from '../commands/RemoveFavoriteCommand';
import { createFavoriteRepositoryMock } from '../favorite-test.helpers';

describe('RemoveFavoriteCommandHandler', () => {
  const favoriteRepository = createFavoriteRepositoryMock();
  const userRepository = { findByAuthId: vi.fn() };
  let handler: RemoveFavoriteCommandHandler;

  beforeEach(() => {
    vi.clearAllMocks();
    userRepository.findByAuthId.mockResolvedValue({ id: 9 });
    favoriteRepository.deleteByUserAndRoom.mockResolvedValue(true);
    handler = new RemoveFavoriteCommandHandler(
      favoriteRepository,
      userRepository as never,
    );
  });

  it('supprime un favori', async () => {
    await handler.execute(new RemoveFavoriteCommand(1, 10));

    expect(favoriteRepository.deleteByUserAndRoom).toHaveBeenCalledWith(9, 10);
  });

  it('refuse si utilisateur introuvable', async () => {
    userRepository.findByAuthId.mockResolvedValue(null);

    await expect(
      handler.execute(new RemoveFavoriteCommand(1, 10)),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('refuse si favori introuvable', async () => {
    favoriteRepository.deleteByUserAndRoom.mockResolvedValue(false);

    await expect(
      handler.execute(new RemoveFavoriteCommand(1, 10)),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
