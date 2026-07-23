export class GetRoomPricingPreviewQuery {
  constructor(
    public readonly startDate: string,
    public readonly endDate: string,
    public readonly guestCount: number,
    public readonly slug?: string,
    public readonly roomId?: number,
  ) {}
}
