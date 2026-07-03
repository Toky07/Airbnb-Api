export class ReservationStatsOutput {
  constructor(
    public readonly activeCount: number,
    public readonly pendingCount: number,
    public readonly monthlyRevenue: number,
    public readonly occupancyRate: number,
    public readonly totalCount: number,
    public readonly recentActivity: ReservationActivityOutput[],
    public readonly recentCustomers: RecentCustomerOutput[],
  ) {}
}

export class ReservationActivityOutput {
  constructor(
    public readonly id: number,
    public readonly label: string,
    public readonly totalPrice: number,
    public readonly createdAt: Date,
    public readonly status: string,
  ) {}
}

export class RecentCustomerOutput {
  constructor(
    public readonly id: number,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly email: string,
    public readonly avatar: string,
  ) {}
}
