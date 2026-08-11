import type { RoomOutput } from '../../../rooms/contracts';
import type { Favorite } from '../../domain/entities/favorite.entity';

export class FavoriteOutput {
  constructor(
    public readonly id: number,
    public readonly roomId: number,
    public readonly createdAt: Date,
    public readonly room: RoomOutput,
  ) {}

  static fromFavorite(favorite: Favorite, room: RoomOutput): FavoriteOutput {
    return new FavoriteOutput(
      favorite.id!,
      favorite.roomId,
      favorite.createdAt!,
      room,
    );
  }
}
