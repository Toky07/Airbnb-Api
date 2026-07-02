import { UnauthorizedException } from '@nestjs/common';
import type { PaginatedResult } from '../../../../../shared/pagination/pagination.types';
import type { IQueryHandler } from '../../../../../shared/useCase/bus/query-handler.interface';
import type { IPropertyRepository } from '../../../../properties/domain/repositories/property.repository';
import type { IPaymentRepository } from '../../../../payment/domain/repositories/payment.repository';
import type { IUserRepository } from '../../../../user/domain/repositories/user.repository';
import type { IReservationRepository } from '../../../domain/repositories/reservation.repository';
import { BookingOrderListItemOutput } from '../../dto/booking-order.output';
import type { ListHostBookingOrdersQuery } from '../queries/ListHostBookingOrdersQuery';
import type { ListBookingOrdersQueryHandler } from './ListBookingOrdersQueryHandler';

export class ListHostBookingOrdersQueryHandler
  implements IQueryHandler<ListHostBookingOrdersQuery, PaginatedResult<BookingOrderListItemOutput>>
{
  constructor(
    private readonly paymentRepository: IPaymentRepository,
    private readonly userRepository: IUserRepository,
    private readonly propertyRepository: IPropertyRepository,
    private readonly reservationRepository: IReservationRepository,
    private readonly listBookingOrdersQueryHandler: ListBookingOrdersQueryHandler,
  ) {}

  async execute(
    query: ListHostBookingOrdersQuery,
  ): Promise<PaginatedResult<BookingOrderListItemOutput>> {
    const user = await this.userRepository.findByAuthId(query.authId);
    if (!user?.id) {
      throw new UnauthorizedException('Utilisateur introuvable.');
    }

    const properties = await this.propertyRepository.findAllByOwnerId(user.id);
    const propertyIds = properties
      .map((property) => property.id)
      .filter((id): id is number => typeof id === 'number' && id > 0);

    if (propertyIds.length === 0) {
      return this.emptyPage(query);
    }

    const scopedPropertyIds =
      query.params.propertyId != null && query.params.propertyId > 0
        ? propertyIds.includes(query.params.propertyId)
          ? [query.params.propertyId]
          : []
        : propertyIds;

    if (scopedPropertyIds.length === 0) {
      return this.emptyPage(query);
    }

    const reservationIds = await this.reservationRepository.findIdsByPropertyIds(
      scopedPropertyIds,
    );

    const result = await this.paymentRepository.findPaginatedForReservationIds(
      reservationIds,
      query.params,
    );

    return this.listBookingOrdersQueryHandler.buildPage(result);
  }

  private emptyPage(
    query: ListHostBookingOrdersQuery,
  ): PaginatedResult<BookingOrderListItemOutput> {
    return {
      data: [],
      meta: {
        page: query.params.page,
        limit: query.params.limit,
        total: 0,
        totalPages: 0,
      },
    };
  }
}
