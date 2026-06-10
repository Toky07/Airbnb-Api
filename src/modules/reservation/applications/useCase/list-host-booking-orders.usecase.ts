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
import {
  PAYMENT_REPOSITORY,
  type IPaymentRepository,
} from '../../../payment/domain/repositories/payment.repository';
import type { ReservationListParams } from '../../domain/repositories/reservation.repository';
import {
  RESERVATION_REPOSITORY,
  type IReservationRepository,
} from '../../domain/repositories/reservation.repository';
import { BookingOrderListItemOutput } from '../dto/booking-order.output';
import { ListBookingOrdersUseCase } from './list-booking-orders.usecase';

@Injectable()
export class ListHostBookingOrdersUseCase {
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(PROPERTY_REPOSITORY)
    private readonly propertyRepository: IPropertyRepository,
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: IReservationRepository,
    private readonly listBookingOrdersUseCase: ListBookingOrdersUseCase,
  ) {}

  async execute(
    authId: number,
    params: ReservationListParams,
  ): Promise<PaginatedResult<BookingOrderListItemOutput>> {
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

    const scopedPropertyIds =
      params.propertyId != null && params.propertyId > 0
        ? propertyIds.includes(params.propertyId)
          ? [params.propertyId]
          : []
        : propertyIds;

    if (scopedPropertyIds.length === 0) {
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

    const reservationIds = await this.reservationRepository.findIdsByPropertyIds(
      scopedPropertyIds,
    );

    const result = await this.paymentRepository.findPaginatedForReservationIds(
      reservationIds,
      params,
    );

    return this.listBookingOrdersUseCase.buildPage(result);
  }
}
