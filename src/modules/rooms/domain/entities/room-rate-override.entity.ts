export class RoomRateOverride {
  constructor(
    public readonly roomId: number,
    public readonly startDate: string,
    public readonly endDate: string,
    public readonly pricePerNight: number,
    public readonly label: string | null = null,
    public readonly id?: number,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}
}
