import type { ICommandHandler } from '@src/shared/useCase/bus/command-handler.interface';
import type { IPaymentRepository } from '@src/modules/payment/domain/repositories/payment.repository';
import type { IPaymentGateway } from '@src/modules/payment/domain/ports/payment-gateway.port';
import type { MapStripeStatusService } from '@src/modules/payment/applications/services/map-stripe-status.service';
import type { VerifyPaymentCommand } from '@src/modules/payment/applications/useCase/commands/VerifyPaymentCommand';
import { PAYMENT_STATUS } from '@src/modules/payment/domain/constants/payment-status.constant';
import { Payment } from '@src/modules/payment/domain/entities/payment.entity';
import { EventBus } from '@src/shared/domain/event.bus';
import { PaymentConfirmedEvent } from '@src/modules/payment/domain/events/payment-confirmed.event';
import type { VerifyPaymentResult } from '@src/modules/payment/applications/dto/verify-payment.result';

export type { VerifyPaymentResult };

export class VerifyPaymentCommandHandler implements ICommandHandler<
  VerifyPaymentCommand,
  VerifyPaymentResult
> {
  constructor(
    private readonly paymentRepository: IPaymentRepository,
    private readonly paymentGateway: IPaymentGateway,
    private readonly mapStripeStatus: MapStripeStatusService,
  ) {}

  async execute(command: VerifyPaymentCommand): Promise<VerifyPaymentResult> {
    const payment = await this.paymentRepository.findById(command.paymentId);

    if (!payment?.id) {
      throw new Error('Paiement introuvable.');
    }

    if (payment.cartId == null) {
      throw new Error('Ce paiement ne correspond pas à un panier.');
    }

    let current = payment;

    if (
      current.status !== PAYMENT_STATUS.SUCCEEDED &&
      current.transactionId != null
    ) {
      const intent = await this.paymentGateway.retrievePaymentIntent(
        current.transactionId,
      );
      const status = this.mapStripeStatus.fromPaymentIntentStatus(
        intent.status,
      );

      if (status !== PAYMENT_STATUS.SUCCEEDED) {
        throw new Error("Le paiement n'est pas encore confirmé.");
      }

      current = await this.paymentRepository.update(
        Payment.create({ ...payment, status: PAYMENT_STATUS.SUCCEEDED }),
      );

      await EventBus.getInstance().publish(new PaymentConfirmedEvent(current));
    }

    return { cartId: current.cartId };
  }
}
