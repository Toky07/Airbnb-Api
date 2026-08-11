import type { RoomBlockedDate } from '@src/modules/rooms/domain/entities/room-blocked-date.entity';

export class RoomBlockedDateOutput {
  constructor(
    public readonly id: number,
    public readonly roomId: number,
    public readonly startDate: string,
    public readonly endDate: string,
    public readonly reason: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static fromDomain(blocked: RoomBlockedDate): RoomBlockedDateOutput {
    return new RoomBlockedDateOutput(
      blocked.id!,
      blocked.roomId,
      blocked.startDate,
      blocked.endDate,
      blocked.reason,
      blocked.createdAt!,
      blocked.updatedAt!,
    );
  }
}
