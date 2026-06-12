import { Inject, Injectable } from '@nestjs/common';
import {
  CART_REPOSITORY,
  type ICartRepository,
} from '../../../cart/domain/repositories/cart.repository';
import { SendPaymentInvoiceNotificationsUseCase } from '../../../invoice/applications/useCase/send-payment-invoice-notifications.usecase';
import { ConfirmReservationUseCase } from '../../../reservation/applications/useCase/confirm-reservation.usecase';
import type { Payment } from '../../domain/entities/payment.entity';

@Injectable()
export class FinalizeSuccessfulPaymentService {
  constructor(
    private readonly confirmReservationUseCase: ConfirmReservationUseCase,
    @Inject(CART_REPOSITORY)
    private readonly cartRepository: ICartRepository,
    private readonly sendPaymentInvoiceNotifications: SendPaymentInvoiceNotificationsUseCase,
  ) {}

  async execute(payment: Payment): Promise<void> {
    const idsToConfirm = payment.reservationIds.length > 0
      ? payment.reservationIds
      : payment.reservationId
        ? [payment.reservationId]
        : [];

    for (const id of idsToConfirm) {
      await this.confirmReservationUseCase.execute(id);
    }

    if (payment.cartId != null) {
      await this.cartRepository.clearItems(payment.cartId);
    }

    await this.sendPaymentInvoiceNotifications.execute(payment);
  }
}
