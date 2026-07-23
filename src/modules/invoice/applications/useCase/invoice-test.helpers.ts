import type { InvoiceData } from '../../domain/types/invoice-data.type';
import { INVOICE_PAYMENT_TYPE } from '../../domain/constants/invoice-payment-type.constant';
import { InvoiceGenerateRequestedEvent } from '../../domain/events/invoice-generate-requested.event';

export function createSampleInvoiceData(
  overrides: Partial<InvoiceData> = {},
): InvoiceData {
  return {
    invoiceNumber: 'FACT-2026-000042',
    paidAt: new Date('2026-06-10T14:30:00.000Z'),
    currency: 'eur',
    totalCents: 32_000,
    recipient: {
      name: 'Jean Dupont',
      email: 'jean@test.com',
      phone: '+33601020304',
    },
    references: [
      { label: 'Stripe', value: 'pi_test_123' },
      { label: 'Paiement', value: '#42' },
    ],
    items: [
      {
        label: 'Suite Deluxe',
        subtitle: 'Hôtel Riviera · Nice',
        quantity: 3,
        unitPriceCents: 10_667,
        totalPriceCents: 32_000,
        columns: {
          dates: '01 juil. → 04 juil. 2026',
          guests: 2,
          nights: 3,
        },
      },
    ],
    issuer: {
      name: 'StayBook SAS',
      address: '10 rue de Paris, 75001 Paris',
      siret: '12345678901234',
      vatNumber: 'FR12345678901',
    },
    totals: {
      subtotalCents: 29_090,
      vatCents: 2_910,
      touristTaxCents: 0,
      serviceFeeCents: 0,
      totalCents: 32_000,
    },
    ...overrides,
  };
}

export function createSampleInvoiceGenerateEvent(
  overrides: Partial<{
    userId: number;
    paymentId: number;
  }> = {},
): InvoiceGenerateRequestedEvent {
  return new InvoiceGenerateRequestedEvent(
    overrides.userId ?? 1,
    INVOICE_PAYMENT_TYPE.RESERVATION,
    overrides.paymentId ?? 42,
    createSampleInvoiceData(),
  );
}
