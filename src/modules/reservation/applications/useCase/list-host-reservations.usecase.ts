import {
  Inject,
  Injectable,
} from '@nestjs/common';
import type { PaginatedResult } from '../../../../shared/pagination/pagination.types';
import {
  PROPERTY_REPOSITORY,
} from '../../../properties/infrastructure/repositories/property.repository';
import type { IPropertyRepository } from '../../../properties/domain/repositories/property.repository';
import type { ReservationListParams } from '../../domain/repositories/reservation.repository';
import { ReservationOutput } from '../dto/reservation.output';
import { ListReservationsUseCase } from './list-reservations.usecase';

@Injectable()
export class ListHostReservationsUseCase {
  constructor(
    @Inject(PROPERTY_REPOSITORY)
    private readonly propertyRepository: IPropertyRepository,
    private readonly listReservationsUseCase: ListReservationsUseCase,
  ) {}

  async execute(
    authId: number,
    params: ReservationListParams,
  ): Promise<PaginatedResult<ReservationOutput>> {
    const properties = await this.propertyRepository.findAllByOwnerId(authId);

    const propertyIds = properties
      .map((property) => property.id)
      .filter((id): id is number => typeof id === 'number' && id > 0);

    if (propertyIds.length === 0) {
      return {
        data: [],
        meta: {
          page: params.page,
          limit: params.limit,
          total: 0,
          totalPages: 0,
        },
      };
    }

    return this.listReservationsUseCase.execute({
      ...params,
      propertyId: undefined,
      propertyIds,
    });
  }
}
