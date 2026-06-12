export class ReservationStatsOutput {
  constructor(
    public readonly activeCount: number,
    public readonly pendingCount: number,
    public readonly monthlyRevenue: number,
    public readonly occupancyRate: number,
    public readonly totalCount: number,
    public readonly recentActivity: ReservationActivityOutput[],
  ) {}
}

export class ReservationActivityOutput {
  constructor(
    public readonly id: number,
    public readonly label: string,
    public readonly totalPrice: number,
    public readonly createdAt: Date,
  ) {}
}
