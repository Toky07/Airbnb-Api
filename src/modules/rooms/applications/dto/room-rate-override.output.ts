import type { RoomRateOverride } from '../../domain/entities/room-rate-override.entity';

export class RoomRateOverrideOutput {
  constructor(
    public readonly id: number,
    public readonly roomId: number,
    public readonly startDate: string,
    public readonly endDate: string,
    public readonly pricePerNight: number,
    public readonly label: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static fromDomain(override: RoomRateOverride): RoomRateOverrideOutput {
    return new RoomRateOverrideOutput(
      override.id!,
      override.roomId,
      override.startDate,
      override.endDate,
      override.pricePerNight,
      override.label,
      override.createdAt!,
      override.updatedAt!,
    );
  }
}
