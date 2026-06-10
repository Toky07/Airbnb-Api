import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomsModule } from '../rooms/room.module';
import { UserModule } from '../user/user.module';
import { CalculateStayAmountService } from './applications/services/calculate-stay-amount.service';
import { MapStripeStatusService } from './applications/services/map-stripe-status.service';
import { CreatePaymentIntentUseCase } from './applications/useCase/create-payment-intent.usecase';
import { GetPaymentUseCase } from './applications/useCase/get-payment.usecase';
import { HandleStripeWebhookUseCase } from './applications/useCase/handle-stripe-webhook.usecase';
import { ListPaymentsUseCase } from './applications/useCase/list-payments.usecase';
import { PAYMENT_GATEWAY } from './domain/ports/payment-gateway.port';
import { PAYMENT_REPOSITORY } from './domain/repositories/payment.repository';
import { PaymentOrmEntity } from './infrastructure/entities/payment.orm-entity';
import { PaymentRepository } from './infrastructure/repositories/payment.repository';
import { StripePaymentGateway } from './infrastructure/stripe/stripe-payment-gateway';
import { PaymentController } from './interfaces/http/payment.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentOrmEntity]),
    RoomsModule,
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
    CalculateStayAmountService,
    MapStripeStatusService,
    CreatePaymentIntentUseCase,
    ListPaymentsUseCase,
    GetPaymentUseCase,
    HandleStripeWebhookUseCase,
  ],
  exports: [PAYMENT_REPOSITORY, CreatePaymentIntentUseCase],
})
export class PaymentModule {}
