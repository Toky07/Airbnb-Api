import { Inject, Injectable } from '@nestjs/common';
import type { PaginatedResult } from '../../../../shared/pagination/pagination.types';
import {
  RESERVATION_REPOSITORY,
  type IReservationRepository,
  type ReservationListParams,
} from '../../domain/repositories/reservation.repository';
import { ReservationOutput } from '../dto/reservation.output';
import { EnrichReservationOutputsService } from '../services/enrich-reservation-outputs.service';

@Injectable()
export class ListReservationsUseCase {
  constructor(
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: IReservationRepository,
    private readonly enrichReservationOutputs: EnrichReservationOutputsService,
  ) {}

  async execute(
    params: ReservationListParams,
  ): Promise<PaginatedResult<ReservationOutput>> {
    const result = await this.reservationRepository.findPaginated(params);
  
    const outputs = result.data.map((reservation) =>
      ReservationOutput.fromDomain(reservation),
    );

    return {
      data: await this.enrichReservationOutputs.enrich(outputs),
      meta: result.meta,
    };
  }
}
