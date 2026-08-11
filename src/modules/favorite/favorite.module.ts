import { Inject, Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '@src/modules/user/user.module';
import { RoomsModule } from '@src/modules/rooms/room.module';
import { USER_REPOSITORY } from '@src/modules/user/contracts';
import type { IUserRepository } from '@src/modules/user/contracts';
import { ROOM_REPOSITORY } from '@src/modules/rooms/contracts';
import type { IRoomRepository } from '@src/modules/rooms/contracts';
import { RoomMediaPresenter } from '@src/modules/rooms/contracts';
import {
  FAVORITE_REPOSITORY,
  type IFavoriteRepository,
} from './domain/repositories/favorite.repository';
import { FavoriteOrmEntity } from './infrastructure/entities/favorite.orm-entity';
import { FavoriteRepository } from './infrastructure/repositories/favorite.repository';
import { FavoriteController } from './interfaces/http/favorite.controller';
import { FavoriteBootstrap } from './favorite.bootstrap';
import { CommandBus } from '@src/shared/useCase/bus/bus';
import { QueryBus } from '@src/shared/useCase/bus/query-bus';
import { AddFavoriteCommand } from './applications/useCase/commands/AddFavoriteCommand';
import { RemoveFavoriteCommand } from './applications/useCase/commands/RemoveFavoriteCommand';
import { ListMyFavoritesQuery } from './applications/useCase/queries/ListMyFavoritesQuery';
import { CheckFavoritesQuery } from './applications/useCase/queries/CheckFavoritesQuery';

@Module({
  imports: [
    TypeOrmModule.forFeature([FavoriteOrmEntity]),
    UserModule,
    RoomsModule,
  ],
  controllers: [FavoriteController],
  providers: [
    FavoriteRepository,
    {
      provide: FAVORITE_REPOSITORY,
      useClass: FavoriteRepository,
    },
  ],
  exports: [FAVORITE_REPOSITORY],
})
export class FavoriteModule implements OnModuleInit {
  constructor(
    @Inject(FAVORITE_REPOSITORY)
    private readonly favoriteRepository: IFavoriteRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
    private readonly roomMediaPresenter: RoomMediaPresenter,
  ) {}

  onModuleInit() {
    const bootstrap = FavoriteBootstrap.create({
      favoriteRepository: this.favoriteRepository,
      userRepository: this.userRepository,
      roomRepository: this.roomRepository,
      roomMediaPresenter: this.roomMediaPresenter,
    });

    CommandBus.register(
      AddFavoriteCommand,
      bootstrap.addFavoriteCommandHandler,
    );
    CommandBus.register(
      RemoveFavoriteCommand,
      bootstrap.removeFavoriteCommandHandler,
    );
    QueryBus.register(
      ListMyFavoritesQuery,
      bootstrap.listMyFavoritesQueryHandler,
    );
    QueryBus.register(
      CheckFavoritesQuery,
      bootstrap.checkFavoritesQueryHandler,
    );
  }
}
