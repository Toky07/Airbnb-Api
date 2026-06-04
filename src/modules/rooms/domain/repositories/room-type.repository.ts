import type { RoomType } from '../entities/room-type.entity';

export interface IRoomTypeRepository {
  findAll(): Promise<RoomType[]>;
  findActive(): Promise<RoomType[]>;
  findById(id: number): Promise<RoomType | null>;
  findBySlug(slug: string): Promise<RoomType | null>;
  create(type: RoomType): Promise<RoomType>;
  update(type: RoomType): Promise<RoomType>;
  delete(id: number): Promise<boolean>;
  countUsages(id: number): Promise<number>;
}

export const ROOM_TYPE_REPOSITORY = 'ROOM_TYPE_REPOSITORY';
