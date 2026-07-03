import type { PaginatedResult } from '../../../../../shared/pagination/pagination.types';
import type { IQueryHandler } from '../../../../../shared/useCase/bus/query-handler.interface';
import type { Payment } from '../../../../payment/domain/entities/payment.entity';
import type { IPaymentRepository } from '../../../../payment/domain/repositories/payment.repository';
import type { IUserRepository } from '../../../../user/domain/repositories/user.repository';
import { BookingOrderListItemOutput } from '../../dto/booking-order.output';
import type { ResolvePaymentReservationsService } from '../../services/resolve-payment-reservations.service';
import {
  filterItemsByPropertyIds,
  groupItemsByPropertyId,
} from '../../services/scope-booking-order-items.service';
import type { ListBookingOrdersQuery } from '../queries/ListBookingOrdersQuery';

export type BuildBookingOrdersPageOptions = {
  propertyIds?: number[];
};

export class ListBookingOrdersQueryHandler
  implements IQueryHandler<ListBookingOrdersQuery, PaginatedResult<BookingOrderListItemOutput>>
{
  constructor(
    private readonly paymentRepository: IPaymentRepository,
    private readonly userRepository: IUserRepository,
    private readonly resolvePaymentReservations: ResolvePaymentReservationsService,
  ) {}

  async execute(
    query: ListBookingOrdersQuery,
  ): Promise<PaginatedResult<BookingOrderListItemOutput>> {
    const result = await this.paymentRepository.findPaginated(query.params);
    return this.buildPage(result);
  }

  async buildPage(
    result: PaginatedResult<Payment>,
    options?: BuildBookingOrdersPageOptions,
  ): Promise<PaginatedResult<BookingOrderListItemOutput>> {
    const itemsByPayment =
      await this.resolvePaymentReservations.resolveForPayments(result.data);

    const users = await this.loadUsers(
      result.data.map((payment) => payment.userId),
    );

    const propertyIds = options?.propertyIds ?? [];
    const data: BookingOrderListItemOutput[] = [];

    for (const payment of result.data) {
      const allItems = payment.id ? (itemsByPayment.get(payment.id) ?? []) : [];
      const user = users.get(payment.userId) ?? null;

      if (propertyIds.length === 0) {
        data.push(BookingOrderListItemOutput.fromParts(payment, allItems, user));
        continue;
      }

      const scopedItems = filterItemsByPropertyIds(allItems, propertyIds);
      const groups = groupItemsByPropertyId(scopedItems);

      for (const [propertyId, items] of groups) {
        data.push(
          BookingOrderListItemOutput.fromParts(payment, items, user, { propertyId }),
        );
      }
    }

    return {
      data,
      meta: result.meta,
    };
  }

  private async loadUsers(userIds: number[]) {
    const uniqueIds = [...new Set(userIds.filter((id) => id > 0))];
    const users = new Map<
      number,
      Awaited<ReturnType<IUserRepository['findById']>>
    >();

    await Promise.all(
      uniqueIds.map(async (userId) => {
        const user = await this.userRepository.findById(userId);
        if (user) {
          users.set(userId, user);
        }
      }),
    );

    return users;
  }
}
