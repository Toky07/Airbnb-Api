import type { PaginatedResult } from '../../../../../shared/pagination/pagination.types';
import type { IQueryHandler } from '../../../../../shared/useCase/bus/query-handler.interface';
import type { IReservationRepository } from '../../../domain/repositories/reservation.repository';
import { ReservationOutput } from '../../dto/reservation.output';
import type { EnrichReservationOutputsService } from '../../services/enrich-reservation-outputs.service';
import type { ListReservationsQuery } from '../queries/ListReservationsQuery';

export class ListReservationsQueryHandler
  implements IQueryHandler<ListReservationsQuery, PaginatedResult<ReservationOutput>>
{
  constructor(
    private readonly reservationRepository: IReservationRepository,
    private readonly enrichReservationOutputs: EnrichReservationOutputsService,
  ) {}

  async execute(
    query: ListReservationsQuery,
  ): Promise<PaginatedResult<ReservationOutput>> {
    const result = await this.reservationRepository.findPaginated(query.params);

    const outputs = result.data.map((reservation) =>
      ReservationOutput.fromDomain(reservation),
    );

    return {
      data: await this.enrichReservationOutputs.enrich(outputs),
      meta: result.meta,
    };
  }
}
