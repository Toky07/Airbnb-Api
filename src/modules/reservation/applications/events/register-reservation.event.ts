import { Inject, OnModuleInit } from '@nestjs/common';
import {
  PAYMENT_REPOSITORY,
  type IPaymentRepository,
} from '@src/modules/payment/contracts';
import {
  RESERVATION_REPOSITORY,
  type IReservationRepository,
} from '@src/modules/reservation/domain/repositories/reservation.repository';
import { PaymentListener } from '@src/modules/reservation/applications/listeners/payment.listener';
import { PaymentConfirmedListener } from '@src/modules/reservation/applications/listeners/payment-confirmed.listener';
import { InvoiceCreatedListener } from '@src/modules/reservation/applications/listeners/invoice-created.listener';
import { CartCheckoutListener } from '@src/modules/reservation/applications/listeners/cart-checkout.listener';
import { BuildCustomerInvoiceEmailBodyService } from '@src/modules/reservation/applications/services/build-customer-invoice-email-body.service';
import { BuildHostPaymentNotificationEmailBodyService } from '@src/modules/reservation/applications/services/build-host-payment-notification-email-body.service';
import { BuildReservationInvoicePayloadService } from '@src/modules/reservation/applications/services/build-reservation-invoice-payload.service';

export class ReservationEvent implements OnModuleInit {
  public constructor(
    @Inject(RESERVATION_REPOSITORY)
    private readonly repository: IReservationRepository,
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
    private readonly buildReservationInvoicePayload: BuildReservationInvoicePayloadService,
    private readonly buildCustomerInvoiceEmailBody: BuildCustomerInvoiceEmailBodyService,
    private readonly buildHostPaymentNotificationEmailBody: BuildHostPaymentNotificationEmailBodyService,
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
    const cartCheckoutListener = new CartCheckoutListener();

    await paymentListener.listen();
    await paymentConfirmedListener.listen();
    await invoiceCreatedListener.listen();
    await cartCheckoutListener.listen();
  }
}
