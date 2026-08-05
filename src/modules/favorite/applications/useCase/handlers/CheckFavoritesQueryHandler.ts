import type { IQueryHandler } from '../../../../../shared/useCase/bus/query-handler.interface';
import type { IFavoriteRepository } from '../../../domain/repositories/favorite.repository';
import { CheckFavoritesOutput } from '../../dto/check-favorites.output';
import type { CheckFavoritesQuery } from '../queries/CheckFavoritesQuery';
import { ResolveFavoriteUserService } from '../../services/resolve-favorite-user.service';

export class CheckFavoritesQueryHandler implements IQueryHandler<
  CheckFavoritesQuery,
  CheckFavoritesOutput
> {
  constructor(
    private readonly favoriteRepository: IFavoriteRepository,
    private readonly resolveFavoriteUserService: ResolveFavoriteUserService,
  ) {}

  async execute(query: CheckFavoritesQuery): Promise<CheckFavoritesOutput> {
    const userId = await this.resolveFavoriteUserService.resolveUserId(
      query.authId,
    );

    const favoritedRoomIds = await this.favoriteRepository.findFavoritedRoomIds(
      userId,
      query.roomIds,
    );

    return CheckFavoritesOutput.fromRoomIds(query.roomIds, favoritedRoomIds);
  }
}
