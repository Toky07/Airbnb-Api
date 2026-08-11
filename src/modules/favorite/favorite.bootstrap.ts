import type { IFavoriteRepository } from './domain/repositories/favorite.repository';
import type { IUserRepository } from '../user/contracts';
import type { IRoomRepository } from '../rooms/domain/repositories/room.repository';
import type { RoomMediaPresenter } from '../rooms/applications/presenters/room-media.presenter';
import { ResolveAuthenticatedUserService } from '../../shared/auth/resolve-authenticated-user.service';
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
    const resolveAuthenticatedUserService = new ResolveAuthenticatedUserService(
      deps.userRepository,
    );

    return {
      addFavoriteCommandHandler: new AddFavoriteCommandHandler(
        deps.favoriteRepository,
        deps.roomRepository,
        deps.roomMediaPresenter,
        resolveAuthenticatedUserService,
      ),
      removeFavoriteCommandHandler: new RemoveFavoriteCommandHandler(
        deps.favoriteRepository,
        resolveAuthenticatedUserService,
      ),
      listMyFavoritesQueryHandler: new ListMyFavoritesQueryHandler(
        deps.favoriteRepository,
        deps.roomRepository,
        deps.roomMediaPresenter,
        resolveAuthenticatedUserService,
      ),
      checkFavoritesQueryHandler: new CheckFavoritesQueryHandler(
        deps.favoriteRepository,
        resolveAuthenticatedUserService,
      ),
    };
  }
}
