import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ForbiddenException } from '@nestjs/common';
import { CheckFavoritesQueryHandler } from './CheckFavoritesQueryHandler';
import { CheckFavoritesQuery } from '../queries/CheckFavoritesQuery';
import {
  createFavoriteRepositoryMock,
  createResolveFavoriteUserServiceMock,
} from '../favorite-test.helpers';
import { ResolveFavoriteUserService } from '../../services/resolve-favorite-user.service';

describe('CheckFavoritesQueryHandler', () => {
  const favoriteRepository = createFavoriteRepositoryMock();
  const resolveFavoriteUserService = createResolveFavoriteUserServiceMock();
  let handler: CheckFavoritesQueryHandler;

  beforeEach(() => {
    vi.clearAllMocks();
    resolveFavoriteUserService.resolveUserId.mockResolvedValue(9);
    favoriteRepository.findFavoritedRoomIds.mockResolvedValue([1, 3]);
    handler = new CheckFavoritesQueryHandler(
      favoriteRepository,
      resolveFavoriteUserService as unknown as ResolveFavoriteUserService,
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
    resolveFavoriteUserService.resolveUserId.mockRejectedValue(
      new ForbiddenException('Accès refusé.'),
    );

    await expect(
      handler.execute(new CheckFavoritesQuery(1, [1])),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
