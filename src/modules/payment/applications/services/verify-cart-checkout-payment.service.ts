import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MapStripeStatusService } from '../services/map-stripe-status.service';
import { PAYMENT_STATUS } from '../../domain/constants/payment-status.constant';
import { Payment } from '../../domain/entities/payment.entity';
import {
  PAYMENT_GATEWAY,
  type IPaymentGateway,
} from '../../domain/ports/payment-gateway.port';
import {
  PAYMENT_REPOSITORY,
  type IPaymentRepository,
} from '../../domain/repositories/payment.repository';
import { EventBus } from '../../../../shared/domain/event.bus';
import { PaymentConfirmedEvent } from '../../domain/events/payment-confirmed.event';
import type { CartCheckoutCompleteRequestedEvent } from '../../../cart/domain/events/cart-checkout-complete-requested.event';

@Injectable()
export class VerifyCartCheckoutPaymentService {
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
    @Inject(PAYMENT_GATEWAY)
    private readonly paymentGateway: IPaymentGateway,
    private readonly mapStripeStatus: MapStripeStatusService,
  ) {}

  async execute(
    event: CartCheckoutCompleteRequestedEvent,
  ): Promise<{ cartId: number }> {
    const payment = await this.paymentRepository.findById(event.paymentId);
    if (!payment?.id) {
      throw new NotFoundException('Paiement introuvable.');
    }

    if (payment.cartId == null) {
      throw new BadRequestException('Ce paiement ne correspond pas à un panier.');
    }

    let currentPayment = payment;

    if (currentPayment.status !== PAYMENT_STATUS.SUCCEEDED && currentPayment.transactionId != null) {
      const stripeIntent = await this.paymentGateway.retrievePaymentIntent(
        currentPayment.transactionId,
      );
      const status = this.mapStripeStatus.fromPaymentIntentStatus(
        stripeIntent.status,
      );

      if (status !== PAYMENT_STATUS.SUCCEEDED) {
        throw new BadRequestException('Le paiement n’est pas encore confirmé.');
      }

      currentPayment = await this.paymentRepository.update(
        Payment.create({
          ...payment,
          status: PAYMENT_STATUS.SUCCEEDED,
        }),
      );

      await EventBus.getInstance().publish(
        new PaymentConfirmedEvent(currentPayment),
      );
    }

    return { cartId: currentPayment.cartId! };
  }
}
