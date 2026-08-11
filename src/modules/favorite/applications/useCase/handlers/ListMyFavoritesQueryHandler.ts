import type { IQueryHandler } from '@src/shared/useCase/bus/query-handler.interface';
import type { IRoomRepository } from '@src/modules/rooms/contracts';
import type { IFavoriteRepository } from '@src/modules/favorite/domain/repositories/favorite.repository';
import { FavoriteOutput } from '@src/modules/favorite/applications/dto/favorite.output';
import type { RoomMediaPresenter } from '@src/modules/rooms/contracts';
import type { ListMyFavoritesQuery } from '@src/modules/favorite/applications/useCase/queries/ListMyFavoritesQuery';
import { ResolveAuthenticatedUserService } from '@src/shared/auth/resolve-authenticated-user.service';

export class ListMyFavoritesQueryHandler implements IQueryHandler<
  ListMyFavoritesQuery,
  FavoriteOutput[]
> {
  constructor(
    private readonly favoriteRepository: IFavoriteRepository,
    private readonly roomRepository: IRoomRepository,
    private readonly roomMediaPresenter: RoomMediaPresenter,
    private readonly resolveAuthenticatedUserService: ResolveAuthenticatedUserService,
  ) {}

  async execute(query: ListMyFavoritesQuery): Promise<FavoriteOutput[]> {
    const userId = await this.resolveAuthenticatedUserService.resolveUserId(
      query.authId,
    );

    const favorites = await this.favoriteRepository.findByUserId(userId);
    const outputs: FavoriteOutput[] = [];

    for (const favorite of favorites) {
      const room = await this.roomRepository.findById(favorite.roomId);
      if (!room) {
        continue;
      }

      const roomOutput = await this.roomMediaPresenter.toOutput(room);
      outputs.push(FavoriteOutput.fromFavorite(favorite, roomOutput));
    }

    return outputs;
  }
}
