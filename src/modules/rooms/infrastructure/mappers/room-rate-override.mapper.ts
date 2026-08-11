import { RoomRateOverride } from '@src/modules/rooms/domain/entities/room-rate-override.entity';
import type { RoomRateOverrideOrmEntity } from '@src/modules/rooms/infrastructure/entities/room-rate-override.orm-entity';

export class RoomRateOverrideMapper {
  static toDomain(entity: RoomRateOverrideOrmEntity): RoomRateOverride {
    return new RoomRateOverride(
      entity.roomId,
      entity.startDate,
      entity.endDate,
      entity.pricePerNight,
      entity.label,
      entity.id,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static toEntity(
    override: RoomRateOverride,
  ): Partial<RoomRateOverrideOrmEntity> {
    return {
      roomId: override.roomId,
      startDate: override.startDate,
      endDate: override.endDate,
      pricePerNight: override.pricePerNight,
      label: override.label,
    };
  }
}
