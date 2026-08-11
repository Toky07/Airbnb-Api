import { Inject } from '@nestjs/common';
import {
  ROOM_REPOSITORY,
  type IRoomRepository,
} from '@src/modules/rooms/contracts';
import type { ReservationStatsScope } from '@src/modules/reservation/domain/repositories/reservation.repository';

export class CountScopedRoomsService {
  constructor(
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
  ) {}

  async count(scope: ReservationStatsScope): Promise<number> {
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

    if (scope.propertyId != null && scope.propertyId > 0) {
      const result = await this.roomRepository.findPaginated({
        page: 1,
        limit: 10,
        propertyId: scope.propertyId,
      });
      return result.meta.total;
    }

    const result = await this.roomRepository.findPaginated({
      page: 1,
      limit: 10,
    });
    return result.meta.total;
  }
}
