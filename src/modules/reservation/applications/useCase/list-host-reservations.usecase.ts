import {
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { PaginatedResult } from '../../../../shared/pagination/pagination.types';
import {
  PROPERTY_REPOSITORY,
} from '../../../properties/infrastructure/repositories/property.repository';
import type { IPropertyRepository } from '../../../properties/domain/repositories/property.repository';
import { USER_REPOSITORY } from '../../../user/infrastructure/repositories/user.repository';
import type { IUserRepository } from '../../../user/domain/repositories/user.repository';
import type { ReservationListParams } from '../../domain/repositories/reservation.repository';
import { ReservationOutput } from '../dto/reservation.output';
import { ListReservationsUseCase } from './list-reservations.usecase';

@Injectable()
export class ListHostReservationsUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(PROPERTY_REPOSITORY)
    private readonly propertyRepository: IPropertyRepository,
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

    const properties = await this.propertyRepository.findAllByOwnerId(user.id);
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

    if (params.propertyId != null && params.propertyId > 0) {
      if (!propertyIds.includes(params.propertyId)) {
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
        propertyId: params.propertyId,
        propertyIds: undefined,
      });
    }

    return this.listReservationsUseCase.execute({
      ...params,
      propertyId: undefined,
      propertyIds,
    });
  }
}
