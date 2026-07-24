import { ForbiddenException } from '@nestjs/common';
import type { IQueryHandler } from '../../../../../shared/useCase/bus/query-handler.interface';
import type { IUserRepository } from '../../../../user/domain/repositories/user.repository';
import type { IRoomRepository } from '../../../../rooms/domain/repositories/room.repository';
import type { IFavoriteRepository } from '../../../domain/repositories/favorite.repository';
import { FavoriteOutput } from '../../dto/favorite.output';
import type { RoomMediaPresenter } from '../../../../rooms/applications/presenters/room-media.presenter';
import type { ListMyFavoritesQuery } from '../queries/ListMyFavoritesQuery';

export class ListMyFavoritesQueryHandler implements IQueryHandler<
  ListMyFavoritesQuery,
  FavoriteOutput[]
> {
  constructor(
    private readonly favoriteRepository: IFavoriteRepository,
    private readonly userRepository: IUserRepository,
    private readonly roomRepository: IRoomRepository,
    private readonly roomMediaPresenter: RoomMediaPresenter,
  ) {}

  async execute(query: ListMyFavoritesQuery): Promise<FavoriteOutput[]> {
    const user = await this.userRepository.findByAuthId(query.authId);
    if (!user?.id) {
      throw new ForbiddenException('Accès refusé.');
    }

    const favorites = await this.favoriteRepository.findByUserId(user.id);
    const outputs: FavoriteOutput[] = [];

    for (const favorite of favorites) {
      const room = await this.roomRepository.findById(favorite.roomId);
      if (!room) {
        continue;
      }

      const roomOutput = await this.roomMediaPresenter.toOutput(room);
      outputs.push(
        new FavoriteOutput(
          favorite.id!,
          favorite.roomId,
          favorite.createdAt!,
          roomOutput,
        ),
      );
    }

    return outputs;
  }
}
