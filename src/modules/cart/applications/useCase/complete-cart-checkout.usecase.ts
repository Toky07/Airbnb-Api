import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { MapStripeStatusService } from '../../../payment/applications/services/map-stripe-status.service';
import { PAYMENT_STATUS } from '../../../payment/domain/constants/payment-status.constant';
import { Payment } from '../../../payment/domain/entities/payment.entity';
import {
  PAYMENT_GATEWAY,
  type IPaymentGateway,
} from '../../../payment/domain/ports/payment-gateway.port';
import {
  PAYMENT_REPOSITORY,
  type IPaymentRepository,
} from '../../../payment/domain/repositories/payment.repository';
import { USER_REPOSITORY } from '../../../user/infrastructure/repositories/user.repository';
import type { IUserRepository } from '../../../user/domain/repositories/user.repository';
import { CartOutput } from '../dto/cart.output';
import { CartPresenter } from '../presenters/cart.presenter';
import {
  ResolveCartService,
  type CartRequestContext,
} from '../services/resolve-cart.service';

@Injectable()
export class CompleteCartCheckoutUseCase {
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
    @Inject(PAYMENT_GATEWAY)
    private readonly paymentGateway: IPaymentGateway,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly mapStripeStatus: MapStripeStatusService,
    private readonly resolveCartService: ResolveCartService,
    private readonly cartPresenter: CartPresenter,
  ) {}

  async execute(
    authId: number,
    paymentId: number,
    context: CartRequestContext,
  ): Promise<CartOutput> {
    const user = await this.userRepository.findByAuthId(authId);
    if (!user?.id) {
      throw new UnauthorizedException('Utilisateur introuvable.');
    }

    const payment = await this.paymentRepository.findById(Number(paymentId));
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
          payment.roomId,
          payment.checkInDate,
          payment.checkOutDate,
          payment.guestCount,
          payment.nights,
          payment.reservationId,
          payment.cartId,
          payment.reservationIds,
          payment.errorMessage,
          payment.id,
          payment.createdAt,
          payment.updatedAt,
          payment.invoiceNotificationsSentAt,
        ),
      );
    }

    const cart = await this.resolveCartService.resolve({
      ...context,
      authId,
    });

    return this.cartPresenter.toOutput(cart);
  }
}
