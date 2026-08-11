import type { Favorite } from '@src/modules/favorite/domain/entities/favorite.entity';

export interface IFavoriteRepository {
  create(favorite: Favorite): Promise<Favorite>;
  deleteByUserAndRoom(userId: number, roomId: number): Promise<boolean>;
  findByUserId(userId: number): Promise<Favorite[]>;
  findByUserAndRoom(userId: number, roomId: number): Promise<Favorite | null>;
  findFavoritedRoomIds(userId: number, roomIds: number[]): Promise<number[]>;
}

export const FAVORITE_REPOSITORY = 'FAVORITE_REPOSITORY';
