import type { IPaymentRepository } from './domain/repositories/payment.repository';
import type { IPaymentGateway } from './domain/ports/payment-gateway.port';
import type { IPaymentPublicConfig } from './domain/ports/payment-public-config.port';
import type { IWebhookVerifier } from './domain/ports/webhook-verifier.port';
import type { IUserRepository } from '@src/modules/user/contracts';
import { CreatePaymentCommandHandler } from './applications/useCase/handlers/CreatePaymentCommandHandler';
import { ConfirmStripePaymentCommandHandler } from './applications/useCase/handlers/ConfirmStripePaymentCommandHandler';
import { VerifyPaymentCommandHandler } from './applications/useCase/handlers/VerifyPaymentCommandHandler';
import { SyncStripeConnectAccountCommandHandler } from './applications/useCase/handlers/SyncStripeConnectAccountCommandHandler';
import { MapStripeStatusService } from './applications/services/map-stripe-status.service';
import { StripeWebhookPayloadValidator } from './applications/services/stripe-webhook-payload.validator';

export class PaymentBootstrap {
  static create(
    repository: IPaymentRepository,
    paymentGateway: IPaymentGateway,
    webhookVerifier: IWebhookVerifier,
    paymentPublicConfig: IPaymentPublicConfig,
    userRepository: IUserRepository,
  ) {
    const mapStripeStatus = new MapStripeStatusService();
    const payloadValidator = new StripeWebhookPayloadValidator();
    const syncStripeConnectAccountCommandHandler =
      new SyncStripeConnectAccountCommandHandler(userRepository);

    return {
      createPaymentCommandHandler: new CreatePaymentCommandHandler(
        repository,
        paymentGateway,
        paymentPublicConfig,
      ),
      confirmStripePaymentCommandHandler:
        new ConfirmStripePaymentCommandHandler(
          repository,
          mapStripeStatus,
          webhookVerifier,
          payloadValidator,
          syncStripeConnectAccountCommandHandler,
        ),
      verifyPaymentCommandHandler: new VerifyPaymentCommandHandler(
        repository,
        paymentGateway,
        mapStripeStatus,
      ),
      syncStripeConnectAccountCommandHandler,
    };
  }
}
