import type { IQueryHandler } from '@src/shared/useCase/bus/query-handler.interface';
import type { IFavoriteRepository } from '@src/modules/favorite/domain/repositories/favorite.repository';
import { CheckFavoritesOutput } from '@src/modules/favorite/applications/dto/check-favorites.output';
import type { CheckFavoritesQuery } from '@src/modules/favorite/applications/useCase/queries/CheckFavoritesQuery';
import { ResolveAuthenticatedUserService } from '@src/shared/auth/resolve-authenticated-user.service';

export class CheckFavoritesQueryHandler implements IQueryHandler<
  CheckFavoritesQuery,
  CheckFavoritesOutput
> {
  constructor(
    private readonly favoriteRepository: IFavoriteRepository,
    private readonly resolveAuthenticatedUserService: ResolveAuthenticatedUserService,
  ) {}

  async execute(query: CheckFavoritesQuery): Promise<CheckFavoritesOutput> {
    const userId = await this.resolveAuthenticatedUserService.resolveUserId(
      query.authId,
    );

    const favoritedRoomIds = await this.favoriteRepository.findFavoritedRoomIds(
      userId,
      query.roomIds,
    );

    return CheckFavoritesOutput.fromRoomIds(query.roomIds, favoritedRoomIds);
  }
}
