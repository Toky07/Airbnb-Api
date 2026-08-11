import type { RecentCustomerOutput } from './recent-customer.output';
import type { ReservationActivityOutput } from './reservation-activity.output';

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
