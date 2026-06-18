import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MapStripeStatusService } from './applications/services/map-stripe-status.service';
import { VerifyCartCheckoutPaymentService } from './applications/services/verify-cart-checkout-payment.service';
import { CreateCartPaymentIntentUseCase } from './applications/useCase/create-cart-payment-intent.usecase';
import { HandleStripeWebhookUseCase } from './applications/useCase/handle-stripe-webhook.usecase';
import { PaymentEvent } from './applications/events/register-payment.event';
import { UserModule } from '../user/user.module';
import { PAYMENT_GATEWAY } from './domain/ports/payment-gateway.port';
import { PAYMENT_REPOSITORY } from './domain/repositories/payment.repository';
import { PaymentOrmEntity } from './infrastructure/entities/payment.orm-entity';
import { PaymentRepository } from './infrastructure/repositories/payment.repository';
import { StripePaymentGateway } from './infrastructure/stripe/stripe-payment-gateway';
import { PaymentController } from './interfaces/http/payment.controller';

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
    HandleStripeWebhookUseCase,
    PaymentEvent,
  ],
  exports: [
    PAYMENT_REPOSITORY,
    PAYMENT_GATEWAY,
    MapStripeStatusService,
    CreateCartPaymentIntentUseCase,
  ],
})
export class PaymentModule {}
