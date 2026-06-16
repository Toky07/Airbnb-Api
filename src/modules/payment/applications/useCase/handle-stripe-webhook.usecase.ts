import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
import { PaymentOutput } from '../dto/payment.output';
import { MapStripeStatusService } from '../services/map-stripe-status.service';
import { EventBus } from '../../../../shared/domain/event.bus';
import { PaymentConfirmedEvent } from '../../domain/events/payment-confirmed.event';

@Injectable()
export class HandleStripeWebhookUseCase {
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
    @Inject(PAYMENT_GATEWAY)
    private readonly paymentGateway: IPaymentGateway,
    private readonly mapStripeStatus: MapStripeStatusService,
  ) {}

  async execute(payload: Buffer, signature: string): Promise<PaymentOutput> {
    if (!payload?.length) {
      throw new BadRequestException('Corps de webhook vide.');
    }

    if (!signature?.trim()) {
      throw new BadRequestException('Signature Stripe manquante.');
    }

    const event = this.paymentGateway.constructWebhookEvent(payload, signature);
    const payment = await this.paymentRepository.findByTransactionId(
      event.paymentIntentId,
    );

    if (!payment?.id) {
      throw new NotFoundException('Paiement introuvable pour cet événement.');
    }

    const status = this.mapStripeStatus.fromWebhookEventType(
      event.type,
      event.status,
    );

    const updated = await this.paymentRepository.update(
      new Payment(
        payment.amount,
        payment.currency,
        status,
        payment.provider,
        payment.transactionId,
        payment.userId,
        payment.propertyType,
        payment.propertyId,
        payment.cartId,
        event.errorMessage ?? payment.errorMessage,
        payment.id,
        payment.createdAt,
        payment.updatedAt,
        payment.invoiceNotificationsSentAt,
      ),
    );

    if (status === PAYMENT_STATUS.SUCCEEDED && updated.id) {
      await EventBus.getInstance().publish(
        new PaymentConfirmedEvent(updated.id),
      );
    }

    return PaymentOutput.fromDomain(updated);
  }
}
