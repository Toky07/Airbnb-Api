import { Inject, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MapStripeStatusService } from './applications/services/map-stripe-status.service';
import { VerifyCartCheckoutPaymentService } from './applications/services/verify-cart-checkout-payment.service';
import { CreateCartPaymentIntentUseCase } from './applications/useCase/create-cart-payment-intent.usecase';
import { PaymentEvent } from './applications/events/register-payment.event';
import { UserModule } from '../user/user.module';
import { type IPaymentGateway, PAYMENT_GATEWAY } from './domain/ports/payment-gateway.port';
import { type IPaymentRepository, PAYMENT_REPOSITORY } from './domain/repositories/payment.repository';
import { PaymentOrmEntity } from './infrastructure/entities/payment.orm-entity';
import { PaymentRepository } from './infrastructure/repositories/payment.repository';
import { StripePaymentGateway } from './infrastructure/stripe/stripe-payment-gateway';
import { PaymentController } from './interfaces/http/payment.controller';
import { OnModuleInit } from '@nestjs/common';
import { PaymentBootstrap } from './payment.bootstrap';
import { CreatePaymentCommand } from './applications/useCase/commands/CreatePaymentCommand';
import { CommandBus } from 'src/shared/useCase/bus/bus';
import { ConfirmStripePaymentCommand } from './applications/useCase/commands/ConfirmStripePaymentCommand';
import { ConfirmStripePaymentCommandHandler } from './applications/useCase/handlers/ConfirmStripePaymentCommandHandler';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentOrmEntity]),
    UserModule,
  ],
  controllers: [PaymentController],
  providers: [
    PaymentRepository,
    {
      provide: PAYMENT_REPOSITORY,
      useClass: PaymentRepository,
    },
    StripePaymentGateway,
    {
      provide: PAYMENT_GATEWAY,
      useClass: StripePaymentGateway,
    },
    MapStripeStatusService,
    VerifyCartCheckoutPaymentService,
    CreateCartPaymentIntentUseCase,
    PaymentEvent,
    ConfirmStripePaymentCommandHandler,
  ],
  exports: [PAYMENT_REPOSITORY],
})
export class PaymentModule implements OnModuleInit {
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
    @Inject(PAYMENT_GATEWAY)
    private readonly paymentGateway: IPaymentGateway,
  ) {}

  onModuleInit() {
    const paymentModule = PaymentBootstrap.create(this.paymentRepository, this.paymentGateway);

    CommandBus.register(CreatePaymentCommand, paymentModule.createPaymentCommandHandler);
    CommandBus.register(ConfirmStripePaymentCommand, paymentModule.confirmStripePaymentCommandHandler);
  }
}
