import { describe, expect, it } from 'vitest';
import {
  INVOICE_PAYMENT_TYPE,
  INVOICE_REPOSITORY,
  InvoiceCreatedEvent,
  InvoiceGenerateRequestedEvent,
  formatInvoiceAmount,
  type InvoiceData,
} from './index';

describe('invoice/contracts', () => {
  it('expose events, tokens et utilitaires publics', () => {
    expect(INVOICE_PAYMENT_TYPE.RESERVATION).toBe('reservation');
    expect(INVOICE_REPOSITORY).toBe('INVOICE_REPOSITORY');
    expect(formatInvoiceAmount(10000, 'eur')).toContain('100');
    expect(
      new InvoiceCreatedEvent(
        1,
        2,
        INVOICE_PAYMENT_TYPE.RESERVATION,
        3,
        '/tmp/a.pdf',
        'FACT-2026-000001',
        'a.pdf',
      ),
    ).toBeInstanceOf(InvoiceCreatedEvent);

    const data: InvoiceData = {
      invoiceNumber: 'FACT-2026-000001',
      paidAt: new Date('2026-06-10T00:00:00.000Z'),
      currency: 'eur',
      totalCents: 0,
      recipient: { name: 'A', email: 'a@b.c' },
      issuer: {
        name: 'X',
        address: 'Y',
        siret: '1',
        vatNumber: '2',
      },
      items: [],
      references: [],
      totals: {
        subtotalCents: 0,
        vatCents: 0,
        touristTaxCents: 0,
        serviceFeeCents: 0,
        totalCents: 0,
      },
    };

    expect(
      new InvoiceGenerateRequestedEvent(
        2,
        INVOICE_PAYMENT_TYPE.RESERVATION,
        3,
        data,
      ),
    ).toBeInstanceOf(InvoiceGenerateRequestedEvent);
  });
});
