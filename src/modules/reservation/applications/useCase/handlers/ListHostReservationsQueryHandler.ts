import type { PaginatedResult } from '../../../../../shared/pagination/pagination.types';
import type { IQueryHandler } from '../../../../../shared/useCase/bus/query-handler.interface';
import type { IPropertyRepository } from '../../../../properties/domain/repositories/property.repository';
import { ReservationOutput } from '../../dto/reservation.output';
import type { ListHostReservationsQuery } from '../queries/ListHostReservationsQuery';
import type { ListReservationsQueryHandler } from './ListReservationsQueryHandler';
import { ListReservationsQuery } from '../queries/ListReservationsQuery';

export class ListHostReservationsQueryHandler
  implements IQueryHandler<ListHostReservationsQuery, PaginatedResult<ReservationOutput>>
{
  constructor(
    private readonly propertyRepository: IPropertyRepository,
    private readonly listReservationsQueryHandler: ListReservationsQueryHandler,
  ) {}

  async execute(
    query: ListHostReservationsQuery,
  ): Promise<PaginatedResult<ReservationOutput>> {
    const properties = await this.propertyRepository.findAllByOwnerId(query.authId);

    const propertyIds = properties
      .map((property) => property.id)
      .filter((id): id is number => typeof id === 'number' && id > 0);

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
