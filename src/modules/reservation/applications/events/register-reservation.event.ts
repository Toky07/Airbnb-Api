import { Inject, OnModuleInit } from '@nestjs/common';
import {
  PAYMENT_REPOSITORY,
  type IPaymentRepository,
} from '../../../payment/domain/repositories/payment.repository';
import {
  RESERVATION_REPOSITORY,
  type IReservationRepository,
} from '../../domain/repositories/reservation.repository';
import { PaymentListener } from '../listeners/payment.listener';
import { PaymentConfirmedListener } from '../listeners/payment-confirmed.listener';
import { InvoiceCreatedListener } from '../listeners/invoice-created.listener';
import { CartCheckoutListener } from '../listeners/cart-checkout.listener';
import { CreateReservationUseCase } from '../useCase/create-reservation.usecase';
import { BuildCustomerInvoiceEmailBodyService } from '../services/build-customer-invoice-email-body.service';
import { BuildHostPaymentNotificationEmailBodyService } from '../services/build-host-payment-notification-email-body.service';
import { BuildReservationInvoicePayloadService } from '../services/build-reservation-invoice-payload.service';

export class ReservationEvent implements OnModuleInit {
  public constructor(
    @Inject(RESERVATION_REPOSITORY)
    private readonly repository: IReservationRepository,
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
    private readonly buildReservationInvoicePayload: BuildReservationInvoicePayloadService,
    private readonly buildCustomerInvoiceEmailBody: BuildCustomerInvoiceEmailBodyService,
    private readonly buildHostPaymentNotificationEmailBody: BuildHostPaymentNotificationEmailBodyService,
    private readonly createReservationUseCase: CreateReservationUseCase,
  ) {}

  public async onModuleInit(): Promise<void> {
    await this.listen();
  }

  public async listen(): Promise<void> {
    const paymentListener = new PaymentListener(this.repository);
    const paymentConfirmedListener = new PaymentConfirmedListener(
      this.repository,
      this.buildReservationInvoicePayload,
    );
    const invoiceCreatedListener = new InvoiceCreatedListener(
      this.paymentRepository,
      this.buildReservationInvoicePayload,
      this.buildCustomerInvoiceEmailBody,
      this.buildHostPaymentNotificationEmailBody,
    );
    const cartCheckoutListener = new CartCheckoutListener(
      this.createReservationUseCase,
    );

    await paymentListener.listen();
    await paymentConfirmedListener.listen();
    await invoiceCreatedListener.listen();
    await cartCheckoutListener.listen();
  }
}
