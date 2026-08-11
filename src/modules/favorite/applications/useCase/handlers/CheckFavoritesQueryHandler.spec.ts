import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ForbiddenException } from '@nestjs/common';
import { CheckFavoritesQueryHandler } from './CheckFavoritesQueryHandler';
import { CheckFavoritesQuery } from '@src/modules/favorite/applications/useCase/queries/CheckFavoritesQuery';
import {
  createFavoriteRepositoryMock,
  createResolveAuthenticatedUserServiceMock,
} from '@src/modules/favorite/applications/useCase/favorite-test.helpers';
import { ResolveAuthenticatedUserService } from '@src/shared/auth/resolve-authenticated-user.service';

describe('CheckFavoritesQueryHandler', () => {
  const favoriteRepository = createFavoriteRepositoryMock();
  const resolveAuthenticatedUserService =
    createResolveAuthenticatedUserServiceMock();
  let handler: CheckFavoritesQueryHandler;

  beforeEach(() => {
    vi.clearAllMocks();
    resolveAuthenticatedUserService.resolveUserId.mockResolvedValue(9);
    favoriteRepository.findFavoritedRoomIds.mockResolvedValue([1, 3]);
    handler = new CheckFavoritesQueryHandler(
      favoriteRepository,
      resolveAuthenticatedUserService as unknown as ResolveAuthenticatedUserService,
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
    resolveAuthenticatedUserService.resolveUserId.mockRejectedValue(
      new ForbiddenException('Accès refusé.'),
    );

    await expect(
      handler.execute(new CheckFavoritesQuery(1, [1])),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
