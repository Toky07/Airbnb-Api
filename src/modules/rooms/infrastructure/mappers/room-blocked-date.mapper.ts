import { RoomBlockedDate } from '@src/modules/rooms/domain/entities/room-blocked-date.entity';
import { RoomBlockedDateOrmEntity } from '@src/modules/rooms/infrastructure/entities/room-blocked-date.orm-entity';

export class RoomBlockedDateMapper {
  static toDomain(entity: RoomBlockedDateOrmEntity): RoomBlockedDate {
    return new RoomBlockedDate(
      entity.roomId,
      entity.startDate,
      entity.endDate,
      entity.reason,
      entity.id,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static toEntity(domain: RoomBlockedDate): Partial<RoomBlockedDateOrmEntity> {
    return {
      id: domain.id,
      roomId: domain.roomId,
      startDate: domain.startDate,
      endDate: domain.endDate,
      reason: domain.reason,
    };
  }
}
