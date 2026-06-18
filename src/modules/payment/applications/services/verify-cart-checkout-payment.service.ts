import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
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
import { USER_REPOSITORY } from '../../../user/infrastructure/repositories/user.repository';
import type { IUserRepository } from '../../../user/domain/repositories/user.repository';
import { EventBus } from '../../../../shared/domain/event.bus';
import { PaymentConfirmedEvent } from '../../domain/events/payment-confirmed.event';
import { CartCheckoutCompleteVerifiedEvent } from '../../../cart/domain/events/cart-checkout-complete-verified.event';
import type { CartCheckoutCompleteRequestedEvent } from '../../../cart/domain/events/cart-checkout-complete-requested.event';

@Injectable()
export class VerifyCartCheckoutPaymentService {
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
    @Inject(PAYMENT_GATEWAY)
    private readonly paymentGateway: IPaymentGateway,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly mapStripeStatus: MapStripeStatusService,
  ) {}

  async execute(
    event: CartCheckoutCompleteRequestedEvent,
  ): Promise<{ cartId: number }> {
    const user = await this.userRepository.findByAuthId(event.authId);
    if (!user?.id) {
      throw new UnauthorizedException('Utilisateur introuvable.');
    }

    const payment = await this.paymentRepository.findById(event.paymentId);
    if (!payment?.id) {
      throw new NotFoundException('Paiement introuvable.');
    }

    if (payment.userId !== user.id) {
      throw new UnauthorizedException('Accès refusé.');
    }

    if (payment.cartId == null) {
      throw new BadRequestException('Ce paiement ne correspond pas à un panier.');
    }

    let currentPayment = payment;

    if (currentPayment.status !== PAYMENT_STATUS.SUCCEEDED) {
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
        new Payment(
          payment.amount,
          payment.currency,
          PAYMENT_STATUS.SUCCEEDED,
          payment.provider,
          payment.transactionId,
          payment.userId,
          payment.propertyType,
          payment.propertyId,
          payment.cartId,
          payment.errorMessage,
          payment.id,
          payment.createdAt,
          payment.updatedAt,
          payment.invoiceNotificationsSentAt,
        ),
      );

      await EventBus.getInstance().publish(
        new PaymentConfirmedEvent(currentPayment),
      );
    }

    return { cartId: currentPayment.cartId! };
  }
}
