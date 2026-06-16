import type { IPaymentRepository } from '../../../payment/domain/repositories/payment.repository';
import type { BuildCustomerInvoiceEmailBodyService } from '../services/build-customer-invoice-email-body.service';
import type { BuildHostPaymentNotificationEmailBodyService } from '../services/build-host-payment-notification-email-body.service';
import type { BuildReservationInvoicePayloadService } from '../services/build-reservation-invoice-payload.service';
import { RESERVATION_NOTIFICATION_SOURCE } from '../../domain/constants/reservation-notification.constant';
import type { InvoiceCreatedEvent } from '../../../invoice/domain/events/invoice-created.event';
import { EmailSendRequestedEvent } from '../../../mail/domain/events/email-send-requested.event';
import { EventBus } from '../../../../shared/domain/event.bus';

export class InvoiceCreatedListener {
  constructor(
    private readonly paymentRepository: IPaymentRepository,
    private readonly buildReservationInvoicePayload: BuildReservationInvoicePayloadService,
    private readonly buildCustomerInvoiceEmailBody: BuildCustomerInvoiceEmailBodyService,
    private readonly buildHostPaymentNotificationEmailBody: BuildHostPaymentNotificationEmailBodyService,
  ) {}

  async listen(): Promise<void> {
    EventBus.getInstance().subscribe(
      'invoice.created',
      async (event: InvoiceCreatedEvent) => {
        const payment = await this.paymentRepository.findById(event.paymentId);
        if (!payment) {
          return;
        }

        const context = await this.buildReservationInvoicePayload.execute(payment);
        if (!context) {
          return;
        }

        await EventBus.getInstance().publish(
          new EmailSendRequestedEvent(
            context.customerEmail,
            `Confirmation de paiement · ${context.invoiceNumber}`,
            this.buildCustomerInvoiceEmailBody.execute(context),
            true,
            RESERVATION_NOTIFICATION_SOURCE.CUSTOMER,
            [
              {
                path: event.path,
                filename: event.fileName,
                mimeType: 'application/pdf',
              },
            ],
          ),
        );

        const hostGroups =
          await this.buildReservationInvoicePayload.buildHostNotificationGroups(
            context,
          );

        for (const group of hostGroups) {
          await EventBus.getInstance().publish(
            new EmailSendRequestedEvent(
              group.ownerEmail,
              `Nouvelle réservation confirmée · ${group.items[0]?.propertyName ?? 'Votre établissement'}`,
              this.buildHostPaymentNotificationEmailBody.execute(context, group),
              true,
              RESERVATION_NOTIFICATION_SOURCE.HOST,
            ),
          );
        }
      },
    );
  }
}
