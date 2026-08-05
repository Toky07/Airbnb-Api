import type { IQueryHandler } from '../../../../../shared/useCase/bus/query-handler.interface';
import type { IRoomRepository } from '../../../../rooms/domain/repositories/room.repository';
import type { IFavoriteRepository } from '../../../domain/repositories/favorite.repository';
import { FavoriteOutput } from '../../dto/favorite.output';
import type { RoomMediaPresenter } from '../../../../rooms/applications/presenters/room-media.presenter';
import type { ListMyFavoritesQuery } from '../queries/ListMyFavoritesQuery';
import { ResolveFavoriteUserService } from '../../services/resolve-favorite-user.service';

export class ListMyFavoritesQueryHandler implements IQueryHandler<
  ListMyFavoritesQuery,
  FavoriteOutput[]
> {
  constructor(
    private readonly favoriteRepository: IFavoriteRepository,
    private readonly roomRepository: IRoomRepository,
    private readonly roomMediaPresenter: RoomMediaPresenter,
    private readonly resolveFavoriteUserService: ResolveFavoriteUserService,
  ) {}

  async execute(query: ListMyFavoritesQuery): Promise<FavoriteOutput[]> {
    const userId = await this.resolveFavoriteUserService.resolveUserId(
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
