import type { RoomBlockedDate } from '@src/modules/rooms/domain/entities/room-blocked-date.entity';

export const ROOM_BLOCKED_DATE_REPOSITORY = 'ROOM_BLOCKED_DATE_REPOSITORY';

export interface IRoomBlockedDateRepository {
  create(blockedDate: RoomBlockedDate): Promise<RoomBlockedDate>;
  delete(id: number): Promise<void>;
  findById(id: number): Promise<RoomBlockedDate | null>;
  findByRoomId(roomId: number): Promise<RoomBlockedDate[]>;
  findOverlapping(
    roomId: number,
    startDate: string,
    endDate: string,
  ): Promise<RoomBlockedDate[]>;
  findRoomIdsUnavailable(checkIn: string, checkOut: string): Promise<number[]>;
}
