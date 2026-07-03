import type { PaginatedResult } from '../../../../../shared/pagination/pagination.types';
import type { IQueryHandler } from '../../../../../shared/useCase/bus/query-handler.interface';
import { ReservationOutput } from '../../dto/reservation.output';
import type { ResolveHostPropertyIdsService } from '../../services/resolve-host-property-ids.service';
import type { ListHostReservationsQuery } from '../queries/ListHostReservationsQuery';
import type { ListReservationsQueryHandler } from './ListReservationsQueryHandler';
import { ListReservationsQuery } from '../queries/ListReservationsQuery';

export class ListHostReservationsQueryHandler
  implements IQueryHandler<ListHostReservationsQuery, PaginatedResult<ReservationOutput>>
{
  constructor(
    private readonly resolveHostPropertyIds: ResolveHostPropertyIdsService,
    private readonly listReservationsQueryHandler: ListReservationsQueryHandler,
  ) {}

  async execute(
    query: ListHostReservationsQuery,
  ): Promise<PaginatedResult<ReservationOutput>> {
    const propertyIds = await this.resolveHostPropertyIds.resolve(
      query.authId,
      query.params.propertyId,
    );

    if (propertyIds.length === 0) {
      return {
        data: [],
        meta: {
          page: query.params.page,
          limit: query.params.limit,
          total: 0,
          totalPages: 0,
        },
      };
    }

    return this.listReservationsQueryHandler.execute(
      new ListReservationsQuery({
        ...query.params,
        propertyId: undefined,
        propertyIds,
      }),
    );
  }
}
