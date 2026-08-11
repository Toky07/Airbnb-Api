import { NotFoundException } from '@nestjs/common';
import type { ICommandHandler } from '@src/shared/useCase/bus/command-handler.interface';
import type { IFavoriteRepository } from '@src/modules/favorite/domain/repositories/favorite.repository';
import type { RemoveFavoriteCommand } from '@src/modules/favorite/applications/useCase/commands/RemoveFavoriteCommand';
import { ResolveAuthenticatedUserService } from '@src/shared/auth/resolve-authenticated-user.service';

export class RemoveFavoriteCommandHandler implements ICommandHandler<
  RemoveFavoriteCommand,
  void
> {
  constructor(
    private readonly favoriteRepository: IFavoriteRepository,
    private readonly resolveAuthenticatedUserService: ResolveAuthenticatedUserService,
  ) {}

  async execute(command: RemoveFavoriteCommand): Promise<void> {
    const userId = await this.resolveAuthenticatedUserService.resolveUserId(
      command.authId,
    );

    const removed = await this.favoriteRepository.deleteByUserAndRoom(
      userId,
      command.roomId,
    );

    if (!removed) {
      throw new NotFoundException('Favori introuvable.');
    }
  }
}
