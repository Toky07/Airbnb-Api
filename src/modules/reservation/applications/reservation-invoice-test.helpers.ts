import type { ReservationInvoiceContext } from '@src/modules/reservation/domain/types/reservation-invoice-context.type';

export function createSampleReservationInvoiceContext(
  overrides: Partial<ReservationInvoiceContext> = {},
): ReservationInvoiceContext {
  return {
    paymentId: 42,
    invoiceNumber: 'FACT-2026-000042',
    transactionId: 'pi_test_123',
    paidAt: new Date('2026-06-10T14:30:00.000Z'),
    amountCents: 32000,
    currency: 'eur',
    customerName: 'Jean Dupont',
    customerEmail: 'jean@test.com',
    customerPhone: '+33601020304',
    lineItems: [
      {
        reservationId: 7,
        roomName: 'Suite Deluxe',
        propertyName: 'Hôtel Riviera',
        propertyCity: 'Nice',
        propertyAddress: '12 Promenade des Anglais',
        propertyCountry: 'France',
        startDate: '2026-07-01',
        endDate: '2026-07-04',
        guestCount: 2,
        nights: 3,
        unitPrice: 106.67,
        totalPrice: 320,
        propertyOwnerId: 5,
      },
    ],
    ...overrides,
  };
}
