import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ForbiddenException } from '@nestjs/common';
import { CheckFavoritesQueryHandler } from './CheckFavoritesQueryHandler';
import { CheckFavoritesQuery } from '../queries/CheckFavoritesQuery';
import { createFavoriteRepositoryMock } from '../favorite-test.helpers';

describe('CheckFavoritesQueryHandler', () => {
  const favoriteRepository = createFavoriteRepositoryMock();
  const userRepository = { findByAuthId: vi.fn() };
  let handler: CheckFavoritesQueryHandler;

  beforeEach(() => {
    vi.clearAllMocks();
    userRepository.findByAuthId.mockResolvedValue({ id: 9 });
    favoriteRepository.findFavoritedRoomIds.mockResolvedValue([1, 3]);
    handler = new CheckFavoritesQueryHandler(
      favoriteRepository,
      userRepository as never,
    );
  });

  it('retourne le statut favori par chambre', async () => {
    const result = await handler.execute(new CheckFavoritesQuery(1, [1, 2, 3]));

    expect(result.favorites).toEqual({
      '1': true,
      '2': false,
      '3': true,
    });
  });

  it('refuse si utilisateur introuvable', async () => {
    userRepository.findByAuthId.mockResolvedValue(null);

    await expect(
      handler.execute(new CheckFavoritesQuery(1, [1])),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
