import { Inject, Injectable } from '@nestjs/common';
import type { PaginatedResult } from '../../../../shared/pagination/pagination.types';
import {
  RESERVATION_REPOSITORY,
  type IReservationRepository,
  type ReservationListParams,
} from '../../domain/repositories/reservation.repository';
import { ReservationOutput } from '../dto/reservation.output';

@Injectable()
export class ListReservationsUseCase {
  constructor(
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: IReservationRepository,
  ) {}

  async execute(
    params: ReservationListParams,
  ): Promise<PaginatedResult<ReservationOutput>> {
    const result = await this.reservationRepository.findPaginated(params);

    return {
      data: result.data.map((reservation) =>
        ReservationOutput.fromDomain(reservation),
      ),
      meta: result.meta,
    };
  }
}
