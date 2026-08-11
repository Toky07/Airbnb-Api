import type { RoomRateOverride } from '@src/modules/rooms/domain/entities/room-rate-override.entity';

export const ROOM_RATE_OVERRIDE_REPOSITORY = 'ROOM_RATE_OVERRIDE_REPOSITORY';

export interface IRoomRateOverrideRepository {
  create(override: RoomRateOverride): Promise<RoomRateOverride>;
  delete(id: number): Promise<void>;
  findById(id: number): Promise<RoomRateOverride | null>;
  findByRoomId(roomId: number): Promise<RoomRateOverride[]>;
  findOverlapping(
    roomId: number,
    startDate: string,
    endDate: string,
  ): Promise<RoomRateOverride[]>;
}
