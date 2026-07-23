import { Inject, Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  type IPaymentGateway,
  PAYMENT_GATEWAY,
} from './domain/ports/payment-gateway.port';
import {
  type IPaymentRepository,
  PAYMENT_REPOSITORY,
} from './domain/repositories/payment.repository';
import { PaymentOrmEntity } from './infrastructure/entities/payment.orm-entity';
import { PaymentRepository } from './infrastructure/repositories/payment.repository';
import { StripePaymentGateway } from './infrastructure/stripe/stripe-payment-gateway';
import { StripeClientProvider } from './infrastructure/stripe/StripeClientProvider';
import { StripeWebhookVerifier } from './infrastructure/stripe/StripeWebhookVerifier';
import { MapStripeStatusService } from './applications/services/map-stripe-status.service';
import { PaymentController } from './interfaces/http/payment.controller';
import { PaymentBootstrap } from './payment.bootstrap';
import { CommandBus } from '../../shared/useCase/bus/bus';
import { CreatePaymentCommand } from './applications/useCase/commands/CreatePaymentCommand';
import { ConfirmStripePaymentCommand } from './applications/useCase/commands/ConfirmStripePaymentCommand';
import { VerifyPaymentCommand } from './applications/useCase/commands/VerifyPaymentCommand';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentOrmEntity])],
  controllers: [PaymentController],
  providers: [
    StripeClientProvider,
    StripeWebhookVerifier,
    MapStripeStatusService,
    {
      provide: PAYMENT_GATEWAY,
      useClass: StripePaymentGateway,
    },
    {
      provide: PAYMENT_REPOSITORY,
      useClass: PaymentRepository,
    },
  ],
  exports: [PAYMENT_REPOSITORY, PAYMENT_GATEWAY],
})
export class PaymentModule implements OnModuleInit {
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
    @Inject(PAYMENT_GATEWAY)
    private readonly paymentGateway: IPaymentGateway,
    private readonly webhookVerifier: StripeWebhookVerifier,
  ) {}

  onModuleInit() {
    const bootstrap = PaymentBootstrap.create(
      this.paymentRepository,
      this.paymentGateway,
      this.webhookVerifier,
    );

    CommandBus.register(
      CreatePaymentCommand,
      bootstrap.createPaymentCommandHandler,
    );
    CommandBus.register(
      ConfirmStripePaymentCommand,
      bootstrap.confirmStripePaymentCommandHandler,
    );
    CommandBus.register(
      VerifyPaymentCommand,
      bootstrap.verifyPaymentCommandHandler,
    );
  }
}
