import { Inject, Injectable } from '@nestjs/common';
import type { PaginatedResult } from '../../../../shared/pagination/pagination.types';
import type { Payment } from '../../../payment/domain/entities/payment.entity';
import {
  PAYMENT_REPOSITORY,
  type IPaymentRepository,
} from '../../../payment/domain/repositories/payment.repository';
import { USER_REPOSITORY } from '../../../user/infrastructure/repositories/user.repository';
import type { IUserRepository } from '../../../user/domain/repositories/user.repository';
import type { ReservationListParams } from '../../domain/repositories/reservation.repository';
import { BookingOrderListItemOutput } from '../dto/booking-order.output';
import { ResolvePaymentReservationsService } from '../services/resolve-payment-reservations.service';

@Injectable()
export class ListBookingOrdersUseCase {
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly resolvePaymentReservations: ResolvePaymentReservationsService,
  ) {}

  async execute(
    params: ReservationListParams,
  ): Promise<PaginatedResult<BookingOrderListItemOutput>> {
    const result = await this.paymentRepository.findPaginated(params);
    return this.buildPage(result);
  }

  async buildPage(
    result: PaginatedResult<Payment>,
  ): Promise<PaginatedResult<BookingOrderListItemOutput>> {
    const itemsByPayment = await this.resolvePaymentReservations.resolveForPayments(
      result.data,
    );

    const users = await this.loadUsers(result.data.map((payment) => payment.userId));

    return {
      data: result.data.map((payment) =>
        BookingOrderListItemOutput.fromParts(
          payment,
          payment.id ? itemsByPayment.get(payment.id) ?? [] : [],
          users.get(payment.userId) ?? null,
        ),
      ),
      meta: result.meta,
    };
  }

  private async loadUsers(userIds: number[]) {
    const uniqueIds = [...new Set(userIds.filter((id) => id > 0))];
    const users = new Map<number, Awaited<ReturnType<IUserRepository['findById']>>>();

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
