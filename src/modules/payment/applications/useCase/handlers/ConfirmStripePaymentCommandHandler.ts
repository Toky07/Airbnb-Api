import { StripeWebhookVerifier } from "../../../infrastructure/stripe/StripeWebhookVerifier";
import { ConfirmStripePaymentCommand } from "../commands/ConfirmStripePaymentCommand";
import Stripe from "stripe";
import { StripeClientProvider } from "../../../infrastructure/stripe/StripeClientProvider";
import { IPaymentRepository } from "../../../domain/repositories/payment.repository";
import { MapStripeStatusService } from "../../services/map-stripe-status.service";
import { EventBus } from "../../../../../shared/domain/event.bus";
import { PaymentConfirmedEvent } from "../../../domain/events/payment-confirmed.event";
import { PAYMENT_STATUS, PaymentStatus } from "../../../domain/constants/payment-status.constant";
import { Payment } from "../../../domain/entities/payment.entity";

export class ConfirmStripePaymentCommandHandler {
    private readonly stripeWebhookVerifier: StripeWebhookVerifier;
    
    constructor(
        private readonly paymentRepository: IPaymentRepository,
        private readonly mapStripeStatus: MapStripeStatusService,
        private readonly stripeClientProvider: StripeClientProvider,
    ) {
        this.stripeWebhookVerifier = new StripeWebhookVerifier();
    }

    async execute(command: ConfirmStripePaymentCommand): Promise<Payment> {
        this.verifyWebhook(command.payload, command.signature);
        const stripe = this.stripeClientProvider.stripe;

        const event = this.stripeWebhookVerifier.verify(stripe, command.payload, command.signature);
        const payment = await this.paymentRepository.findByTransactionId(event.paymentIntentId);

        if (!payment) {
            throw new Error('Paiement introuvable pour cet événement.');
        }

        const status = this.mapStripeStatus.fromWebhookEventType(
            event.type,
            event.status,
        );

        const newPayment = await this.updatePaymentStatus(payment, status);

        if (status === PAYMENT_STATUS.SUCCEEDED) {
            await EventBus.getInstance().publish(
              new PaymentConfirmedEvent(payment),
            );
        }

        return newPayment;
    }

    private async updatePaymentStatus(payment: Payment, status: PaymentStatus): Promise<Payment> {
        payment.status = status;
        return this.paymentRepository.update(payment);
    }

    private verifyWebhook(payload: Buffer, signature: string): void {
        if (!payload?.length) {
            throw new Error('Corps de webhook vide.');
        }

        if (!signature?.trim()) {
            throw new Error('Signature Stripe manquante.');
        }
    }
}
