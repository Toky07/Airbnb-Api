import type {
  PaginatedResult,
  PaginationParams,
} from '@src/shared/pagination/pagination.types';
import { Room } from '@src/modules/rooms/domain/entities/room.entity';

export interface IRoomRepository {
  create(room: Room): Promise<Room>;
  update(room: Room): Promise<Room>;
  findById(id: number): Promise<Room | null>;
  findBySlug(slug: string): Promise<Room | null>;
  findAll(): Promise<Room[]>;
  findPaginated(params: PaginationParams): Promise<PaginatedResult<Room>>;
  delete(id: number): Promise<boolean>;
}

export const ROOM_REPOSITORY = 'ROOM_REPOSITORY';
