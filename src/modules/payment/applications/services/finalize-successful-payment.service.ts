import { Inject, Injectable } from '@nestjs/common';
import {
  CART_REPOSITORY,
  type ICartRepository,
} from '../../../cart/domain/repositories/cart.repository';
import { ConfirmReservationUseCase } from '../../../reservation/applications/useCase/confirm-reservation.usecase';
import type { Payment } from '../../domain/entities/payment.entity';

@Injectable()
export class FinalizeSuccessfulPaymentService {
  constructor(
    private readonly confirmReservationUseCase: ConfirmReservationUseCase,
    @Inject(CART_REPOSITORY)
    private readonly cartRepository: ICartRepository,
  ) {}

  async execute(payment: Payment): Promise<void> {
    const reservationIds =
      payment.reservationIds.length > 0
        ? payment.reservationIds
        : payment.reservationId != null
          ? [payment.reservationId]
          : [];

    for (const reservationId of reservationIds) {
      await this.confirmReservationUseCase.execute(reservationId);
    }

    if (payment.cartId != null) {
      await this.cartRepository.clearItems(payment.cartId);
    }
  }
}
