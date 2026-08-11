import type { IQueryHandler } from '../../../../../shared/useCase/bus/query-handler.interface';
import type { IUserRepository } from '../../../../user/contracts';
import { RESERVATION_STATUS } from '../../../domain/constants/reservation-status.constant';
import type { IReservationRepository } from '../../../domain/repositories/reservation.repository';
import {
  RecentCustomerOutput,
  ReservationActivityOutput,
  ReservationStatsOutput,
} from '../../dto/reservation-stats.output';
import { ReservationItemOutput } from '../../dto/reservation-item.output';
import type { EnrichReservationOutputsService } from '../../services/enrich-reservation-outputs.service';
import type { CountScopedRoomsService } from '../../services/count-scoped-rooms.service';
import type { ResolveReservationStatsScopeService } from '../../services/resolve-reservation-stats-scope.service';
import {
  buildReservationActivityLabel,
  computeOccupancyRate,
} from '../../utils/reservation-stats.utils';
import type { GetReservationStatsQuery } from '../queries/GetReservationStatsQuery';

export class GetReservationStatsQueryHandler implements IQueryHandler<
  GetReservationStatsQuery,
  ReservationStatsOutput
> {
  constructor(
    private readonly reservationRepository: IReservationRepository,
    private readonly resolveStatsScope: ResolveReservationStatsScopeService,
    private readonly countScopedRooms: CountScopedRoomsService,
    private readonly enrichReservationOutputs: EnrichReservationOutputsService,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    query: GetReservationStatsQuery,
  ): Promise<ReservationStatsOutput> {
    const scope = await this.resolveStatsScope.resolve(
      query.authId,
      query.access,
    );
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const daysInMonth = new Date(year, month, 0).getDate();

    const [
      activeCount,
      pendingCount,
      totalCount,
      monthlyRevenue,
      confirmedNights,
      recentItems,
      roomCount,
    ] = await Promise.all([
      this.reservationRepository.countByScope(
        scope,
        RESERVATION_STATUS.CONFIRMED,
      ),
      this.reservationRepository.countByScope(
        scope,
        RESERVATION_STATUS.PENDING,
      ),
      this.reservationRepository.countByScope(scope),
      this.reservationRepository.sumConfirmedRevenueForMonth(
        year,
        month,
        scope,
      ),
      this.reservationRepository.sumConfirmedNightsForMonth(year, month, scope),
      this.reservationRepository.findRecentItems(5, scope),
      this.countScopedRooms.count(scope),
    ]);

    const occupancyRate = computeOccupancyRate(
      confirmedNights,
      roomCount,
      daysInMonth,
    );
    const enrichedRecent = await this.enrichReservationOutputs.enrichItems(
      recentItems.map((item) => ReservationItemOutput.fromDomain(item)),
    );

    const reservationIds = [
      ...new Set(recentItems.map((item) => item.reservationId)),
    ];
    const reservations =
      reservationIds.length > 0
        ? await this.reservationRepository.findByIds(reservationIds)
        : [];
    const statusMap = new Map(reservations.map((r) => [r.id!, r.status]));

    const recentReservationsPage =
      await this.reservationRepository.findPaginated({
        page: 1,
        limit: 20,
        ...(scope.propertyIds?.length
          ? { propertyIds: scope.propertyIds }
          : {}),
        ...(scope.propertyId != null && scope.propertyId > 0
          ? { propertyId: scope.propertyId }
          : {}),
      });
    const uniqueCustomerIds = [
      ...new Set(recentReservationsPage.data.map((r) => r.userId)),
    ];
    const customers = await Promise.all(
      uniqueCustomerIds
        .slice(0, 6)
        .map((id) => this.userRepository.findById(id)),
    );
    const recentCustomers = customers
      .filter((u): u is NonNullable<typeof u> => u !== null)
      .map(
        (u) =>
          new RecentCustomerOutput(
            u.id!,
            u.firstName,
            u.lastName,
            u.email,
            u.avatar,
          ),
      );

    return new ReservationStatsOutput(
      activeCount,
      pendingCount,
      Number(monthlyRevenue.toFixed(2)),
      occupancyRate,
      totalCount,
      enrichedRecent.map(
        (item) =>
          new ReservationActivityOutput(
            item.id,
            buildReservationActivityLabel(item),
            item.price,
            item.createdAt,
            statusMap.get(item.reservationId) ?? 'pending',
          ),
      ),
      recentCustomers,
    );
  }
}
