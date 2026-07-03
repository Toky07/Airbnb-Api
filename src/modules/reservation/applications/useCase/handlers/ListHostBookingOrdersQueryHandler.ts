import type { PaginatedResult } from '../../../../../shared/pagination/pagination.types';
import type { IQueryHandler } from '../../../../../shared/useCase/bus/query-handler.interface';
import type { IPaymentRepository } from '../../../../payment/domain/repositories/payment.repository';
import type { IReservationRepository } from '../../../domain/repositories/reservation.repository';
import { BookingOrderListItemOutput } from '../../dto/booking-order.output';
import type { ResolveHostPropertyIdsService } from '../../services/resolve-host-property-ids.service';
import type { ListHostBookingOrdersQuery } from '../queries/ListHostBookingOrdersQuery';
import type { ListBookingOrdersQueryHandler } from './ListBookingOrdersQueryHandler';

export class ListHostBookingOrdersQueryHandler implements IQueryHandler<
  ListHostBookingOrdersQuery,
  PaginatedResult<BookingOrderListItemOutput>
> {
  constructor(
    private readonly paymentRepository: IPaymentRepository,
    private readonly reservationRepository: IReservationRepository,
    private readonly resolveHostPropertyIds: ResolveHostPropertyIdsService,
    private readonly listBookingOrdersQueryHandler: ListBookingOrdersQueryHandler,
  ) {}

  async execute(
    query: ListHostBookingOrdersQuery,
  ): Promise<PaginatedResult<BookingOrderListItemOutput>> {
    const scopedPropertyIds = await this.resolveHostPropertyIds.resolve(
      query.authId,
      query.params.propertyId,
    );

    if (scopedPropertyIds.length === 0) {
      return this.emptyPage(query);
    }

    const reservationIds =
      await this.reservationRepository.findIdsByPropertyIds(scopedPropertyIds);

    const result = await this.paymentRepository.findPaginatedForReservationIds(
      reservationIds,
      query.params,
    );

    return this.listBookingOrdersQueryHandler.buildPage(result, {
      propertyIds: scopedPropertyIds,
    });
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
