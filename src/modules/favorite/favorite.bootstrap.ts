import type { IFavoriteRepository } from './domain/repositories/favorite.repository';
import type { IUserRepository } from '../user/domain/repositories/user.repository';
import type { IRoomRepository } from '../rooms/domain/repositories/room.repository';
import type { RoomMediaPresenter } from '../rooms/applications/presenters/room-media.presenter';
import { AddFavoriteCommandHandler } from './applications/useCase/handlers/AddFavoriteCommandHandler';
import { RemoveFavoriteCommandHandler } from './applications/useCase/handlers/RemoveFavoriteCommandHandler';
import { ListMyFavoritesQueryHandler } from './applications/useCase/handlers/ListMyFavoritesQueryHandler';
import { CheckFavoritesQueryHandler } from './applications/useCase/handlers/CheckFavoritesQueryHandler';

export class FavoriteBootstrap {
  static create(deps: {
    favoriteRepository: IFavoriteRepository;
    userRepository: IUserRepository;
    roomRepository: IRoomRepository;
    roomMediaPresenter: RoomMediaPresenter;
  }) {
    return {
      addFavoriteCommandHandler: new AddFavoriteCommandHandler(
        deps.favoriteRepository,
        deps.userRepository,
        deps.roomRepository,
        deps.roomMediaPresenter,
      ),
      removeFavoriteCommandHandler: new RemoveFavoriteCommandHandler(
        deps.favoriteRepository,
        deps.userRepository,
      ),
      listMyFavoritesQueryHandler: new ListMyFavoritesQueryHandler(
        deps.favoriteRepository,
        deps.userRepository,
        deps.roomRepository,
        deps.roomMediaPresenter,
      ),
      checkFavoritesQueryHandler: new CheckFavoritesQueryHandler(
        deps.favoriteRepository,
        deps.userRepository,
      ),
    };
  }
}
