import type { ICommandHandler } from '../../../../../shared/useCase/bus/command-handler.interface';
import type { ConfirmStripePaymentCommand } from '../commands/ConfirmStripePaymentCommand';
import type { IPaymentRepository } from '../../../domain/repositories/payment.repository';
import type { IWebhookVerifier } from '../../../domain/ports/webhook-verifier.port';
import type { MapStripeStatusService } from '../../services/map-stripe-status.service';
import type { PaymentStatus } from '../../../domain/constants/payment-status.constant';
import { PAYMENT_STATUS } from '../../../domain/constants/payment-status.constant';
import { EventBus } from '../../../../../shared/domain/event.bus';
import { PaymentConfirmedEvent } from '../../../domain/events/payment-confirmed.event';
import { Payment } from '../../../domain/entities/payment.entity';
import { StripeWebhookPayloadValidator } from '../../services/stripe-webhook-payload.validator';

export class ConfirmStripePaymentCommandHandler
  implements ICommandHandler<ConfirmStripePaymentCommand, Payment>
{
  constructor(
    private readonly paymentRepository: IPaymentRepository,
    private readonly mapStripeStatus: MapStripeStatusService,
    private readonly webhookVerifier: IWebhookVerifier,
    private readonly payloadValidator: StripeWebhookPayloadValidator = new StripeWebhookPayloadValidator(),
  ) {}

  async execute(command: ConfirmStripePaymentCommand): Promise<Payment> {
    this.payloadValidator.validate(command.payload, command.signature);

    const event = this.webhookVerifier.verify(command.payload, command.signature);
    const payment = await this.paymentRepository.findByTransactionId(event.paymentIntentId);

    if (!payment) {
      throw new Error('Paiement introuvable pour cet événement.');
    }

    const status = this.mapStripeStatus.fromWebhookEventType(
      event.type,
      event.status,
    );

    const updatedPayment = await this.updatePaymentStatus(payment, status);

    if (status === PAYMENT_STATUS.SUCCEEDED) {
      await EventBus.getInstance().publish(
        new PaymentConfirmedEvent(updatedPayment),
      );
    }

    return updatedPayment;
  }

  private async updatePaymentStatus(payment: Payment, status: PaymentStatus): Promise<Payment> {
    payment.status = status;
    return this.paymentRepository.update(payment);
  }
}
