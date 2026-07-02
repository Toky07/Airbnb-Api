import type { IPaymentRepository } from './domain/repositories/payment.repository';
import type { IPaymentGateway } from './domain/ports/payment-gateway.port';
import type { IWebhookVerifier } from './domain/ports/webhook-verifier.port';
import { CreatePaymentCommandHandler } from './applications/useCase/handlers/CreatePaymentCommandHandler';
import { ConfirmStripePaymentCommandHandler } from './applications/useCase/handlers/ConfirmStripePaymentCommandHandler';
import { VerifyPaymentCommandHandler } from './applications/useCase/handlers/VerifyPaymentCommandHandler';
import { MapStripeStatusService } from './applications/services/map-stripe-status.service';
import { StripeWebhookPayloadValidator } from './applications/services/stripe-webhook-payload.validator';

export class PaymentBootstrap {
  static create(
    repository: IPaymentRepository,
    paymentGateway: IPaymentGateway,
    webhookVerifier: IWebhookVerifier,
  ) {
    const mapStripeStatus = new MapStripeStatusService();
    const payloadValidator = new StripeWebhookPayloadValidator();

    return {
      createPaymentCommandHandler: new CreatePaymentCommandHandler(repository, paymentGateway),
      confirmStripePaymentCommandHandler: new ConfirmStripePaymentCommandHandler(
        repository,
        mapStripeStatus,
        webhookVerifier,
        payloadValidator,
      ),
      verifyPaymentCommandHandler: new VerifyPaymentCommandHandler(
        repository,
        paymentGateway,
        mapStripeStatus,
      ),
    };
  }
}
