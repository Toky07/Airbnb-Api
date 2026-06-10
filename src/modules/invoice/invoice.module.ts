import { Module, forwardRef } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { PaymentModule } from '../payment/payment.module';
import { PropertiesModule } from '../properties/properties.module';
import { ReservationModule } from '../reservation/reservation.module';
import { RoomsModule } from '../rooms/room.module';
import { UserModule } from '../user/user.module';
import { BuildCustomerInvoiceEmailBodyService } from './applications/services/build-customer-invoice-email-body.service';
import { BuildHostPaymentNotificationEmailBodyService } from './applications/services/build-host-payment-notification-email-body.service';
import { BuildPaymentInvoiceDataService } from './applications/services/build-payment-invoice-data.service';
import { GenerateInvoicePdfService } from './applications/services/generate-invoice-pdf.service';
import { SendPaymentInvoiceNotificationsUseCase } from './applications/useCase/send-payment-invoice-notifications.usecase';

@Module({
  imports: [
    MailModule,
    UserModule,
    RoomsModule,
    PropertiesModule,
    forwardRef(() => PaymentModule),
    forwardRef(() => ReservationModule),
  ],
  providers: [
    BuildPaymentInvoiceDataService,
    GenerateInvoicePdfService,
    BuildCustomerInvoiceEmailBodyService,
    BuildHostPaymentNotificationEmailBodyService,
    SendPaymentInvoiceNotificationsUseCase,
  ],
  exports: [SendPaymentInvoiceNotificationsUseCase],
})
export class InvoiceModule {}
