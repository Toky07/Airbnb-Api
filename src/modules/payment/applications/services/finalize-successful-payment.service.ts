import { Inject, Injectable } from '@nestjs/common';
import {
  CART_REPOSITORY,
  type ICartRepository,
} from '../../../cart/domain/repositories/cart.repository';
import { SendPaymentInvoiceNotificationsUseCase } from '../../../invoice/applications/useCase/send-payment-invoice-notifications.usecase';
import { ConfirmReservationUseCase } from '../../../reservation/applications/useCase/confirm-reservation.usecase';
import type { Payment } from '../../domain/entities/payment.entity';
import { PAYMENT_TYPE } from '../../domain/types/payment.type';

@Injectable()
export class FinalizeSuccessfulPaymentService {
  constructor(
    private readonly confirmReservationUseCase: ConfirmReservationUseCase,
    @Inject(CART_REPOSITORY)
    private readonly cartRepository: ICartRepository,
    private readonly sendPaymentInvoiceNotifications: SendPaymentInvoiceNotificationsUseCase,
  ) {}

  async execute(payment: Payment): Promise<void> {
    const reservationId = payment.propertyType === PAYMENT_TYPE.RESERVATION ? payment.propertyId : null;

    if (reservationId) {
      await this.confirmReservationUseCase.execute(reservationId);
    }

    if (payment.cartId != null) {
      await this.cartRepository.clearItems(payment.cartId);
    }

    await this.sendPaymentInvoiceNotifications.execute(payment);
  }
}
