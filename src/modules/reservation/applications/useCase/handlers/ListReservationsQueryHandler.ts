import type { PaginatedResult } from '@src/shared/pagination/pagination.types';
import type { IQueryHandler } from '@src/shared/useCase/bus/query-handler.interface';
import type { IReservationRepository } from '@src/modules/reservation/domain/repositories/reservation.repository';
import { ReservationOutput } from '@src/modules/reservation/applications/dto/reservation.output';
import type { EnrichReservationOutputsService } from '@src/modules/reservation/applications/services/enrich-reservation-outputs.service';
import type { ListReservationsQuery } from '@src/modules/reservation/applications/useCase/queries/ListReservationsQuery';

export class ListReservationsQueryHandler implements IQueryHandler<
  ListReservationsQuery,
  PaginatedResult<ReservationOutput>
> {
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
