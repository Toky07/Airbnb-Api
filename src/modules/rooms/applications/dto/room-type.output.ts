import type { RoomType } from '@src/modules/rooms/domain/entities/room-type.entity';

export class RoomTypeOutput {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly slug: string,
    public readonly sortOrder: number,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static fromDomain(type: RoomType): RoomTypeOutput {
    return new RoomTypeOutput(
      type.id!,
      type.name,
      type.slug,
      type.sortOrder,
      type.isActive,
      type.createdAt!,
      type.updatedAt!,
    );
  }
}
