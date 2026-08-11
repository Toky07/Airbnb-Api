import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EventBus } from '@src/shared/domain/event.bus';
import { INVOICE_PAYMENT_TYPE } from '@src/modules/invoice/contracts';
import { InvoiceCreatedEvent } from '@src/modules/invoice/contracts';
import { EmailSendRequestedEvent } from '@src/modules/mail/contracts';
import {
  PAYMENT_PROVIDER,
  PAYMENT_STATUS,
  PAYMENT_TYPE,
  Payment,
} from '@src/modules/payment/contracts';
import { RESERVATION_NOTIFICATION_SOURCE } from '@src/modules/reservation/domain/constants/reservation-notification.constant';
import { InvoiceCreatedListener } from '@src/modules/reservation/applications/listeners/invoice-created.listener';
import { createSampleReservationInvoiceContext } from '@src/modules/reservation/applications/reservation-invoice-test.helpers';

describe('InvoiceCreatedListener', () => {
  const paymentRepository = {
    findById: vi.fn(),
  };
  const buildReservationInvoicePayload = {
    execute: vi.fn(),
    buildHostNotificationGroups: vi.fn(),
  };
  const buildCustomerInvoiceEmailBody = {
    execute: vi.fn(),
  };
  const buildHostPaymentNotificationEmailBody = {
    execute: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    EventBus.getInstance()['handlers'] = new Map();

    paymentRepository.findById.mockResolvedValue(
      new Payment(
        32000,
        'eur',
        PAYMENT_STATUS.SUCCEEDED,
        PAYMENT_PROVIDER.STRIPE,
        'pi_test_123',
        1,
        PAYMENT_TYPE.RESERVATION,
        3,
      ),
    );
    buildReservationInvoicePayload.execute.mockResolvedValue(
      createSampleReservationInvoiceContext(),
    );
    buildReservationInvoicePayload.buildHostNotificationGroups.mockResolvedValue(
      [
        {
          ownerId: 5,
          ownerEmail: 'host@test.com',
          ownerName: 'Marie Martin',
          items: createSampleReservationInvoiceContext().lineItems,
        },
      ],
    );
    buildCustomerInvoiceEmailBody.execute.mockReturnValue(
      '<p>Confirmation</p>',
    );
    buildHostPaymentNotificationEmailBody.execute.mockReturnValue(
      '<p>Host</p>',
    );
  });

  it('publie les emails client et hôte après invoice.created', async () => {
    const published: EmailSendRequestedEvent[] = [];
    EventBus.getInstance().subscribe(
      'email.send.requested',
      async (event: EmailSendRequestedEvent) => {
        published.push(event);
      },
    );

    const listener = new InvoiceCreatedListener(
      paymentRepository as never,
      buildReservationInvoicePayload as never,
      buildCustomerInvoiceEmailBody,
      buildHostPaymentNotificationEmailBody,
    );
    await listener.listen();

    await EventBus.getInstance().publish(
      new InvoiceCreatedEvent(
        9,
        1,
        INVOICE_PAYMENT_TYPE.RESERVATION,
        42,
        'uploads/invoices/facture-FACT-2026-000042.pdf',
        'FACT-2026-000042',
        'facture-FACT-2026-000042.pdf',
      ),
    );

    expect(published).toHaveLength(2);
    expect(published[0]).toMatchObject({
      to: 'jean@test.com',
      sourceModule: RESERVATION_NOTIFICATION_SOURCE.CUSTOMER,
      attachments: [
        expect.objectContaining({
          path: 'uploads/invoices/facture-FACT-2026-000042.pdf',
          mimeType: 'application/pdf',
        }),
      ],
    });
    expect(published[1]).toMatchObject({
      to: 'host@test.com',
      sourceModule: RESERVATION_NOTIFICATION_SOURCE.HOST,
    });
  });
});
