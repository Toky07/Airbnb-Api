import { UnauthorizedException } from '@nestjs/common';
import type { PaginatedResult } from '../../../../../shared/pagination/pagination.types';
import type { IQueryHandler } from '../../../../../shared/useCase/bus/query-handler.interface';
import type { IUserRepository } from '../../../../user/domain/repositories/user.repository';
import { ReservationOutput } from '../../dto/reservation.output';
import type { ListMyReservationsQuery } from '../queries/ListMyReservationsQuery';
import type { ListReservationsQueryHandler } from './ListReservationsQueryHandler';
import { ListReservationsQuery } from '../queries/ListReservationsQuery';

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
