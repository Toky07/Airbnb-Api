import { ForbiddenException } from '@nestjs/common';
import type { IQueryHandler } from '../../../../../shared/useCase/bus/query-handler.interface';
import type { IUserRepository } from '../../../../user/domain/repositories/user.repository';
import type { IFavoriteRepository } from '../../../domain/repositories/favorite.repository';
import { CheckFavoritesOutput } from '../../dto/check-favorites.output';
import type { CheckFavoritesQuery } from '../queries/CheckFavoritesQuery';

export class CheckFavoritesQueryHandler implements IQueryHandler<
  CheckFavoritesQuery,
  CheckFavoritesOutput
> {
  constructor(
    private readonly favoriteRepository: IFavoriteRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(query: CheckFavoritesQuery): Promise<CheckFavoritesOutput> {
    const user = await this.userRepository.findByAuthId(query.authId);
    if (!user?.id) {
      throw new ForbiddenException('Accès refusé.');
    }

    const favoritedRoomIds = await this.favoriteRepository.findFavoritedRoomIds(
      user.id,
      query.roomIds,
    );

    return CheckFavoritesOutput.fromRoomIds(query.roomIds, favoritedRoomIds);
  }
}
