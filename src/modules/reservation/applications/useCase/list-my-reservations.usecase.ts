import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { PaginatedResult } from '../../../../shared/pagination/pagination.types';
import { RoomProductSummaryService } from '../../../rooms/applications/services/room-product-summary.service';
import { USER_REPOSITORY } from '../../../user/infrastructure/repositories/user.repository';
import type { IUserRepository } from '../../../user/domain/repositories/user.repository';
import type { ReservationListParams } from '../../domain/repositories/reservation.repository';
import { ReservationOutput } from '../dto/reservation.output';
import { ListReservationsUseCase } from './list-reservations.usecase';

@Injectable()
export class ListMyReservationsUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly listReservationsUseCase: ListReservationsUseCase,
    private readonly roomProductSummary: RoomProductSummaryService,
  ) {}

  async execute(
    authId: number,
    params: ReservationListParams,
  ): Promise<PaginatedResult<ReservationOutput>> {
    const user = await this.userRepository.findByAuthId(authId);
    if (!user?.id) {
      throw new UnauthorizedException('Utilisateur introuvable.');
    }

    const result = await this.listReservationsUseCase.execute({
      ...params,
      userId: user.id,
    });

    const summaries = await this.roomProductSummary.getByRoomIds(
      result.data.map((reservation) => reservation.roomId),
    );

    return {
      data: result.data.map((reservation) =>
        ReservationOutput.enrich(
          reservation,
          summaries.get(reservation.roomId),
        ),
      ),
      meta: result.meta,
    };
  }
}
