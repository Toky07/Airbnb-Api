import { NotFoundException } from '@nestjs/common';
import type { ICommandHandler } from '../../../../../shared/useCase/bus/command-handler.interface';
import type { IFavoriteRepository } from '../../../domain/repositories/favorite.repository';
import type { RemoveFavoriteCommand } from '../commands/RemoveFavoriteCommand';
import { ResolveFavoriteUserService } from '../../services/resolve-favorite-user.service';

export class RemoveFavoriteCommandHandler implements ICommandHandler<
  RemoveFavoriteCommand,
  void
> {
  constructor(
    private readonly favoriteRepository: IFavoriteRepository,
    private readonly resolveFavoriteUserService: ResolveFavoriteUserService,
  ) {}

  async execute(command: RemoveFavoriteCommand): Promise<void> {
    const userId = await this.resolveFavoriteUserService.resolveUserId(
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
