import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalculateStayAmountService } from '../../shared/pricing/calculate-stay-amount.service';
import { CartModule } from '../cart/cart.module';
import { InvoiceModule } from '../invoice/invoice.module';
import { ReservationModule } from '../reservation/reservation.module';
import { RoomsModule } from '../rooms/room.module';
import { UserModule } from '../user/user.module';
import { MapStripeStatusService } from './applications/services/map-stripe-status.service';
import { FinalizeSuccessfulPaymentService } from './applications/services/finalize-successful-payment.service';
import { CreateCartPaymentIntentUseCase } from './applications/useCase/create-cart-payment-intent.usecase';
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
    forwardRef(() => ReservationModule),
    forwardRef(() => CartModule),
    forwardRef(() => InvoiceModule),
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
    FinalizeSuccessfulPaymentService,
    CreateCartPaymentIntentUseCase,
    ListPaymentsUseCase,
    GetPaymentUseCase,
    HandleStripeWebhookUseCase,
  ],
  exports: [
    PAYMENT_REPOSITORY,
    PAYMENT_GATEWAY,
    MapStripeStatusService,
    FinalizeSuccessfulPaymentService,
    CreateCartPaymentIntentUseCase,
  ],
})
export class PaymentModule {}
