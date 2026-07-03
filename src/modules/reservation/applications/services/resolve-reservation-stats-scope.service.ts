import { UnauthorizedException } from '@nestjs/common';
import type { ReservationStatsScope } from '../../domain/repositories/reservation.repository';
import type { GetReservationStatsQuery } from '../useCase/queries/GetReservationStatsQuery';
import { ResolveHostPropertyIdsService } from './resolve-host-property-ids.service';

export class ResolveReservationStatsScopeService {
  constructor(private readonly resolveHostPropertyIds: ResolveHostPropertyIdsService) {}

  async resolve(
    authId: number,
    access: GetReservationStatsQuery['access'],
  ): Promise<ReservationStatsScope> {
    if (access.canReadAll) {
      return {};
    }

    if (access.canReadHost) {
      const propertyIds = await this.resolveHostPropertyIds.resolve(authId);
      return propertyIds.length > 0 ? { propertyIds } : { propertyId: -1 };
    }

    throw new UnauthorizedException('Accès refusé.');
  }
}
