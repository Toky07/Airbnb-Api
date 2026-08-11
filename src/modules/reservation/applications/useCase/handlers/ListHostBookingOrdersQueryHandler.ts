import type { PaginatedResult } from '@src/shared/pagination/pagination.types';
import type { IQueryHandler } from '@src/shared/useCase/bus/query-handler.interface';
import type { IPaymentRepository } from '@src/modules/payment/contracts';
import type { IReservationRepository } from '@src/modules/reservation/domain/repositories/reservation.repository';
import { BookingOrderListItemOutput } from '@src/modules/reservation/applications/dto/booking-order.output';
import type { ResolveHostPropertyIdsService } from '@src/modules/reservation/applications/services/resolve-host-property-ids.service';
import type { ListHostBookingOrdersQuery } from '@src/modules/reservation/applications/useCase/queries/ListHostBookingOrdersQuery';
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
