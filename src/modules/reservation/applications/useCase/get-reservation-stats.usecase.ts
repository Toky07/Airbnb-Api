import {
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  PROPERTY_REPOSITORY,
} from '../../../properties/infrastructure/repositories/property.repository';
import type { IPropertyRepository } from '../../../properties/domain/repositories/property.repository';
import {
  ROOM_REPOSITORY,
  type IRoomRepository,
} from '../../../rooms/domain/repositories/room.repository';
import { USER_REPOSITORY } from '../../../user/infrastructure/repositories/user.repository';
import type { IUserRepository } from '../../../user/domain/repositories/user.repository';
import { RESERVATION_STATUS } from '../../domain/constants/reservation-status.constant';
import {
  RESERVATION_REPOSITORY,
  type IReservationRepository,
  type ReservationStatsScope,
} from '../../domain/repositories/reservation.repository';
import {
  ReservationActivityOutput,
  ReservationStatsOutput,
} from '../dto/reservation-stats.output';
import { EnrichReservationOutputsService } from '../services/enrich-reservation-outputs.service';
import { ReservationOutput } from '../dto/reservation.output';

export type ReservationStatsAccess = {
  canReadAll: boolean;
  canReadHost: boolean;
};

@Injectable()
export class GetReservationStatsUseCase {
  constructor(
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: IReservationRepository,
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(PROPERTY_REPOSITORY)
    private readonly propertyRepository: IPropertyRepository,
    private readonly enrichReservationOutputs: EnrichReservationOutputsService,
  ) {}

  async execute(
    authId: number,
    access: ReservationStatsAccess,
  ): Promise<ReservationStatsOutput> {
    const scope = await this.resolveScope(authId, access);
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
      recent,
    ] = await Promise.all([
      this.reservationRepository.countByScope(scope, RESERVATION_STATUS.CONFIRMED),
      this.reservationRepository.countByScope(scope, RESERVATION_STATUS.PENDING),
      this.reservationRepository.countByScope(scope),
      this.reservationRepository.sumConfirmedRevenueForMonth(year, month, scope),
      this.reservationRepository.sumConfirmedNightsForMonth(year, month, scope),
      this.reservationRepository.findRecent(5, scope),
    ]);

    const roomCount = await this.countRooms(scope);
    const maxNights = roomCount * daysInMonth;
    const occupancyRate =
      maxNights > 0 ? Math.min(100, Math.round((confirmedNights / maxNights) * 100)) : 0;

    const enrichedRecent = await this.enrichReservationOutputs.enrich(
      recent.map((reservation) => ReservationOutput.fromDomain(reservation)),
    );

    return new ReservationStatsOutput(
      activeCount,
      pendingCount,
      Number(monthlyRevenue.toFixed(2)),
      occupancyRate,
      totalCount,
      enrichedRecent.map(
        (reservation) =>
          new ReservationActivityOutput(
            reservation.id,
            this.buildActivityLabel(reservation),
            reservation.status,
            reservation.totalPrice,
            reservation.createdAt,
          ),
      ),
    );
  }

  private async resolveScope(
    authId: number,
    access: ReservationStatsAccess,
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

  private buildActivityLabel(reservation: ReservationOutput): string {
    if (reservation.roomName && reservation.propertyName) {
      return `${reservation.roomName} — ${reservation.propertyName}`;
    }

    return `Réservation #${reservation.id}`;
  }
}
