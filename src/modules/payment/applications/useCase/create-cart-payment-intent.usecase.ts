import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PAYMENT_PROVIDER } from '../../domain/constants/payment-provider.constant';
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
import { CreatePaymentIntentOutput } from '../dto/create-payment-intent.output';
import {
  getStripeCurrency,
  getStripePublishableKey,
} from '../../infrastructure/stripe/stripe.config';
import { PAYMENT_TYPE } from '../../domain/types/payment.type';
import { EventBus } from '../../../../shared/domain/event.bus';
import { PaymentCreatedEvent } from '../../domain/events/payment-created.event';

export type CreateCartPaymentIntentParams = {
  authId: number;
  cartId: number;
  amountInCents: number;
  propertyType: (typeof PAYMENT_TYPE)[keyof typeof PAYMENT_TYPE];
  propertyId: number;
};

@Injectable()
export class CreateCartPaymentIntentUseCase {
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
    @Inject(PAYMENT_GATEWAY)
    private readonly paymentGateway: IPaymentGateway,
  ) {}

  async execute(
    params: CreateCartPaymentIntentParams,
  ): Promise<CreatePaymentIntentOutput> {
    if (!params.authId) {
      throw new UnauthorizedException('Utilisateur introuvable.');
    }

    if (params.amountInCents <= 0) {
      throw new BadRequestException('Montant de panier invalide.');
    }

    const currency = getStripeCurrency();

    const paymentIntent = await this.paymentGateway.createPaymentIntent({
      amount: params.amountInCents,
      currency,
      metadata: {
        cartId: String(params.cartId),
        userId: String(params.authId),
        propertyType: params.propertyType,
        propertyId: String(params.propertyId),
      },
    });

    if (!paymentIntent.clientSecret) {
      throw new BadRequestException('Impossible de créer le paiement Stripe.');
    }

    const payment = await this.paymentRepository.create(
      Payment.create({
        amount: params.amountInCents,
        currency,
        status: PAYMENT_STATUS.PENDING,
        provider: PAYMENT_PROVIDER.STRIPE,
        transactionId: paymentIntent.id,
        userId: params.authId,
        propertyType: params.propertyType,
        propertyId: params.propertyId,
        cartId: params.cartId,
      }),
    );

    await EventBus.getInstance().publish(new PaymentCreatedEvent(
      payment.id!,
      params.propertyType,
      params.propertyId,
    ))

    return new CreatePaymentIntentOutput(
      payment.id!,
      paymentIntent.clientSecret,
      params.amountInCents,
      currency,
      getStripePublishableKey(),
    );
  }
}
