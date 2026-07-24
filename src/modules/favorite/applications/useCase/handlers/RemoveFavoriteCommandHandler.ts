import {
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import type { ICommandHandler } from '../../../../../shared/useCase/bus/command-handler.interface';
import type { IUserRepository } from '../../../../user/domain/repositories/user.repository';
import type { IFavoriteRepository } from '../../../domain/repositories/favorite.repository';
import type { RemoveFavoriteCommand } from '../commands/RemoveFavoriteCommand';

export class RemoveFavoriteCommandHandler implements ICommandHandler<
  RemoveFavoriteCommand,
  void
> {
  constructor(
    private readonly favoriteRepository: IFavoriteRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: RemoveFavoriteCommand): Promise<void> {
    const user = await this.userRepository.findByAuthId(command.authId);
    if (!user?.id) {
      throw new ForbiddenException('Accès refusé.');
    }

    const removed = await this.favoriteRepository.deleteByUserAndRoom(
      user.id,
      command.roomId,
    );

    if (!removed) {
      throw new NotFoundException('Favori introuvable.');
    }
  }
}
