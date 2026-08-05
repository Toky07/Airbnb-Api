import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { RemoveFavoriteCommandHandler } from './RemoveFavoriteCommandHandler';
import { RemoveFavoriteCommand } from '../commands/RemoveFavoriteCommand';
import {
  createFavoriteRepositoryMock,
  createResolveFavoriteUserServiceMock,
} from '../favorite-test.helpers';
import { ResolveFavoriteUserService } from '../../services/resolve-favorite-user.service';

describe('RemoveFavoriteCommandHandler', () => {
  const favoriteRepository = createFavoriteRepositoryMock();
  const resolveFavoriteUserService = createResolveFavoriteUserServiceMock();
  let handler: RemoveFavoriteCommandHandler;

  beforeEach(() => {
    vi.clearAllMocks();
    resolveFavoriteUserService.resolveUserId.mockResolvedValue(9);
    favoriteRepository.deleteByUserAndRoom.mockResolvedValue(true);
    handler = new RemoveFavoriteCommandHandler(
      favoriteRepository,
      resolveFavoriteUserService as unknown as ResolveFavoriteUserService,
    );
  });

  it('supprime un favori', async () => {
    await handler.execute(new RemoveFavoriteCommand(1, 10));

    expect(favoriteRepository.deleteByUserAndRoom).toHaveBeenCalledWith(9, 10);
  });

  it('refuse si utilisateur introuvable', async () => {
    resolveFavoriteUserService.resolveUserId.mockRejectedValue(
      new ForbiddenException('Accès refusé.'),
    );

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
