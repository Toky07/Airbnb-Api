import { UnauthorizedException } from '@nestjs/common';
import type { PaginatedResult } from '@src/shared/pagination/pagination.types';
import type { IQueryHandler } from '@src/shared/useCase/bus/query-handler.interface';
import type { IUserRepository } from '@src/modules/user/contracts';
import { ReservationOutput } from '@src/modules/reservation/applications/dto/reservation.output';
import type { ListMyReservationsQuery } from '@src/modules/reservation/applications/useCase/queries/ListMyReservationsQuery';
import type { ListReservationsQueryHandler } from './ListReservationsQueryHandler';
import { ListReservationsQuery } from '@src/modules/reservation/applications/useCase/queries/ListReservationsQuery';

export class ListMyReservationsQueryHandler implements IQueryHandler<
  ListMyReservationsQuery,
  PaginatedResult<ReservationOutput>
> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly listReservationsQueryHandler: ListReservationsQueryHandler,
  ) {}

  async execute(
    query: ListMyReservationsQuery,
  ): Promise<PaginatedResult<ReservationOutput>> {
    const user = await this.userRepository.findByAuthId(query.authId);
    if (!user?.id) {
      throw new UnauthorizedException('Utilisateur introuvable.');
    }

    return this.listReservationsQueryHandler.execute(
      new ListReservationsQuery({
        ...query.params,
        userId: user.id,
      }),
    );
  }
}
