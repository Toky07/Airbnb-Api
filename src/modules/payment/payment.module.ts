import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MapStripeStatusService } from './applications/services/map-stripe-status.service';
import { CreateCartPaymentIntentUseCase } from './applications/useCase/create-cart-payment-intent.usecase';
import { HandleStripeWebhookUseCase } from './applications/useCase/handle-stripe-webhook.usecase';
import { PAYMENT_GATEWAY } from './domain/ports/payment-gateway.port';
import { PAYMENT_REPOSITORY } from './domain/repositories/payment.repository';
import { PaymentOrmEntity } from './infrastructure/entities/payment.orm-entity';
import { PaymentRepository } from './infrastructure/repositories/payment.repository';
import { StripePaymentGateway } from './infrastructure/stripe/stripe-payment-gateway';
import { PaymentController } from './interfaces/http/payment.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentOrmEntity])
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
    CreateCartPaymentIntentUseCase,
    HandleStripeWebhookUseCase,
  ],
  exports: [
    PAYMENT_REPOSITORY,
    PAYMENT_GATEWAY,
    MapStripeStatusService,
    CreateCartPaymentIntentUseCase,
  ],
})
export class PaymentModule {}
