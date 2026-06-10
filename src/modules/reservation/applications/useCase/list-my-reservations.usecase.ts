import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { PaginatedResult } from '../../../../shared/pagination/pagination.types';
import { USER_REPOSITORY } from '../../../user/infrastructure/repositories/user.repository';
import type { IUserRepository } from '../../../user/domain/repositories/user.repository';
import type { ReservationListParams } from '../../domain/repositories/reservation.repository';
import { ReservationOutput } from '../dto/reservation.output';
import { EnrichReservationOutputsService } from '../services/enrich-reservation-outputs.service';
import { ListReservationsUseCase } from './list-reservations.usecase';

@Injectable()
export class ListMyReservationsUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly listReservationsUseCase: ListReservationsUseCase,
  ) {}

  async execute(
    authId: number,
    params: ReservationListParams,
  ): Promise<PaginatedResult<ReservationOutput>> {
    const user = await this.userRepository.findByAuthId(authId);
    if (!user?.id) {
      throw new UnauthorizedException('Utilisateur introuvable.');
    }

    return this.listReservationsUseCase.execute({
      ...params,
      userId: user.id,
    });
  }
}
