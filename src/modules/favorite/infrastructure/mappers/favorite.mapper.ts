import { Favorite } from '../../domain/entities/favorite.entity';
import { FavoriteOrmEntity } from '../entities/favorite.orm-entity';

export class FavoriteMapper {
  static toDomain(entity: FavoriteOrmEntity): Favorite {
    return new Favorite(
      entity.id,
      entity.userId,
      entity.roomId,
      entity.createdAt,
    );
  }

  static toEntity(favorite: Favorite): FavoriteOrmEntity {
    const entity = new FavoriteOrmEntity();
    if (favorite.id != null) {
      entity.id = favorite.id;
    }
    entity.userId = favorite.userId;
    entity.roomId = favorite.roomId;
    return entity;
  }
}
