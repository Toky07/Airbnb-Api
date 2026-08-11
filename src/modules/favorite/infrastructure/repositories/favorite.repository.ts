import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Favorite } from '@src/modules/favorite/domain/entities/favorite.entity';
import type { IFavoriteRepository } from '@src/modules/favorite/domain/repositories/favorite.repository';
import { FavoriteOrmEntity } from '@src/modules/favorite/infrastructure/entities/favorite.orm-entity';
import { FavoriteMapper } from '@src/modules/favorite/infrastructure/mappers/favorite.mapper';

@Injectable()
export class FavoriteRepository implements IFavoriteRepository {
  constructor(
    @InjectRepository(FavoriteOrmEntity)
    private readonly repository: Repository<FavoriteOrmEntity>,
  ) {}

  async create(favorite: Favorite): Promise<Favorite> {
    const entity = this.repository.create(FavoriteMapper.toEntity(favorite));
    const saved = await this.repository.save(entity);
    return FavoriteMapper.toDomain(saved);
  }

  async deleteByUserAndRoom(userId: number, roomId: number): Promise<boolean> {
    const result = await this.repository.delete({ userId, roomId });
    return (result.affected ?? 0) > 0;
  }

  async findByUserId(userId: number): Promise<Favorite[]> {
    const entities = await this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return entities.map((entity) => FavoriteMapper.toDomain(entity));
  }

  async findByUserAndRoom(
    userId: number,
    roomId: number,
  ): Promise<Favorite | null> {
    const entity = await this.repository.findOne({
      where: { userId, roomId },
    });
    return entity ? FavoriteMapper.toDomain(entity) : null;
  }

  async findFavoritedRoomIds(
    userId: number,
    roomIds: number[],
  ): Promise<number[]> {
    if (roomIds.length === 0) {
      return [];
    }

    const entities = await this.repository.find({
      where: { userId, roomId: In(roomIds) },
      select: ['roomId'],
    });

    return entities.map((entity) => entity.roomId);
  }
}
