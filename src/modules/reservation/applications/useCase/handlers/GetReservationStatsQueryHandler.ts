import { UnauthorizedException } from '@nestjs/common';
import type { IQueryHandler } from '../../../../../shared/useCase/bus/query-handler.interface';
import type { IPropertyRepository } from '../../../../properties/domain/repositories/property.repository';
import type { IRoomRepository } from '../../../../rooms/domain/repositories/room.repository';
import type { IUserRepository } from '../../../../user/domain/repositories/user.repository';
import { RESERVATION_STATUS } from '../../../domain/constants/reservation-status.constant';
import type {
  IReservationRepository,
  ReservationStatsScope,
} from '../../../domain/repositories/reservation.repository';
import {
  ReservationActivityOutput,
  ReservationStatsOutput,
} from '../../dto/reservation-stats.output';
import { ReservationItemOutput } from '../../dto/reservation-item.output';
import type { EnrichReservationOutputsService } from '../../services/enrich-reservation-outputs.service';
import type { GetReservationStatsQuery } from '../queries/GetReservationStatsQuery';

export class GetReservationStatsQueryHandler
  implements IQueryHandler<GetReservationStatsQuery, ReservationStatsOutput>
{
  constructor(
    private readonly reservationRepository: IReservationRepository,
    private readonly roomRepository: IRoomRepository,
    private readonly userRepository: IUserRepository,
    private readonly propertyRepository: IPropertyRepository,
    private readonly enrichReservationOutputs: EnrichReservationOutputsService,
  ) {}

  async execute(query: GetReservationStatsQuery): Promise<ReservationStatsOutput> {
    const scope = await this.resolveScope(query.authId, query.access);
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
    ] = await Promise.all([
      this.reservationRepository.countByScope(scope, RESERVATION_STATUS.CONFIRMED),
      this.reservationRepository.countByScope(scope, RESERVATION_STATUS.PENDING),
      this.reservationRepository.countByScope(scope),
      this.reservationRepository.sumConfirmedRevenueForMonth(year, month, scope),
      this.reservationRepository.sumConfirmedNightsForMonth(year, month, scope),
      this.reservationRepository.findRecentItems(5, scope),
    ]);

    const roomCount = await this.countRooms(scope);
    const maxNights = roomCount * daysInMonth;
    const occupancyRate =
      maxNights > 0 ? Math.min(100, Math.round((confirmedNights / maxNights) * 100)) : 0;

    const enrichedRecent = await this.enrichReservationOutputs.enrichItems(
      recentItems.map((item) => ReservationItemOutput.fromDomain(item)),
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
            this.buildActivityLabel(item),
            item.price,
            item.createdAt,
          ),
      ),
    );
  }

  private async resolveScope(
    authId: number,
    access: GetReservationStatsQuery['access'],
  ): Promise<ReservationStatsScope> {
    if (access.canReadAll) {
      return {};
    }

    if (access.canReadHost) {
      const user = await this.userRepository.findByAuthId(authId);
      if (!user?.id) {
        throw new UnauthorizedException('Utilisateur introuvable.');
      }

      const properties = await this.propertyRepository.findAllByOwnerId(user.id);
      const propertyIds = properties
        .map((property) => property.id)
        .filter((id): id is number => typeof id === 'number' && id > 0);

      return propertyIds.length > 0 ? { propertyIds } : { propertyId: -1 };
    }

    throw new UnauthorizedException('Accès refusé.');
  }

  private async countRooms(scope: ReservationStatsScope): Promise<number> {
    if (scope.propertyId === -1) {
      return 0;
    }

    if (scope.propertyIds?.length) {
      const results = await Promise.all(
        scope.propertyIds.map((propertyId) =>
          this.roomRepository.findPaginated({
            page: 1,
            limit: 10,
            propertyId,
          }),
        ),
      );

      return results.reduce((total, result) => total + result.meta.total, 0);
    }

    const result = await this.roomRepository.findPaginated({
      page: 1,
      limit: 10,
      propertyId: scope.propertyId,
    });

    return result.meta.total;
  }

  private buildActivityLabel(item: ReservationItemOutput): string {
    if (item.roomName && item.propertyName) {
      return `${item.roomName} — ${item.propertyName}`;
    }

    return `Séjour #${item.id}`;
  }
}
