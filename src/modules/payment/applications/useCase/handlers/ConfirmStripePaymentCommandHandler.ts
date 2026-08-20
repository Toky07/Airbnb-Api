import type { ICommandHandler } from '@src/shared/useCase/bus/command-handler.interface';
import type { ConfirmStripePaymentCommand } from '@src/modules/payment/applications/useCase/commands/ConfirmStripePaymentCommand';
import type { IPaymentRepository } from '@src/modules/payment/domain/repositories/payment.repository';
import type { IWebhookVerifier } from '@src/modules/payment/domain/ports/webhook-verifier.port';
import type { MapStripeStatusService } from '@src/modules/payment/applications/services/map-stripe-status.service';
import type { PaymentStatus } from '@src/modules/payment/domain/constants/payment-status.constant';
import { PAYMENT_STATUS } from '@src/modules/payment/domain/constants/payment-status.constant';
import { EventBus } from '@src/shared/domain/event.bus';
import { PaymentConfirmedEvent } from '@src/modules/payment/domain/events/payment-confirmed.event';
import { Payment } from '@src/modules/payment/domain/entities/payment.entity';
import { StripeWebhookPayloadValidator } from '@src/modules/payment/applications/services/stripe-webhook-payload.validator';
import type { SyncStripeConnectAccountCommandHandler } from '@src/modules/payment/applications/useCase/handlers/SyncStripeConnectAccountCommandHandler';
import { SyncStripeConnectAccountCommand } from '@src/modules/payment/applications/useCase/commands/SyncStripeConnectAccountCommand';

export class ConfirmStripePaymentCommandHandler implements ICommandHandler<
  ConfirmStripePaymentCommand,
  Payment | { received: true }
> {
  constructor(
    private readonly paymentRepository: IPaymentRepository,
    private readonly mapStripeStatus: MapStripeStatusService,
    private readonly webhookVerifier: IWebhookVerifier,
    private readonly payloadValidator: StripeWebhookPayloadValidator = new StripeWebhookPayloadValidator(),
    private readonly syncStripeConnectAccount?: SyncStripeConnectAccountCommandHandler,
  ) {}

  async execute(
    command: ConfirmStripePaymentCommand,
  ): Promise<Payment | { received: true }> {
    this.payloadValidator.validate(command.payload, command.signature);

    const event = this.webhookVerifier.verify(
      command.payload,
      command.signature,
    );

    if (event.type.startsWith('account.')) {
      if (event.accountId && this.syncStripeConnectAccount) {
        await this.syncStripeConnectAccount.execute(
          new SyncStripeConnectAccountCommand(
            event.accountId,
            Boolean(event.chargesEnabled),
            Boolean(event.payoutsEnabled),
            event.type === 'account.application.deauthorized',
          ),
        );
      }
      return { received: true };
    }

    if (!event.paymentIntentId) {
      throw new Error('Paiement introuvable pour cet événement.');
    }

    const payment = await this.paymentRepository.findByTransactionId(
      event.paymentIntentId,
    );

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

  private async updatePaymentStatus(
    payment: Payment,
    status: PaymentStatus,
  ): Promise<Payment> {
    payment.status = status;
    return this.paymentRepository.update(payment);
  }
}
