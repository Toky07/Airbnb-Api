import { PAYMENT_TYPE } from 'src/modules/payment/domain/types/payment.type';
import { PAYMENT_PROVIDER } from '../../../payment/domain/constants/payment-provider.constant';
import { PAYMENT_STATUS } from '../../../payment/domain/constants/payment-status.constant';
import { Payment } from '../../../payment/domain/entities/payment.entity';
import type { PaymentInvoiceData } from '../../domain/types/payment-invoice-data.type';

export function createSampleInvoiceData(
  overrides: Partial<PaymentInvoiceData> = {},
): PaymentInvoiceData {
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

export function createSamplePaymentForInvoice(
  overrides: Partial<{
    id: number;
    invoiceNotificationsSentAt: Date | null;
  }> = {},
): Payment {
  return new Payment(
    32000,
    'eur',
    PAYMENT_STATUS.SUCCEEDED,
    PAYMENT_PROVIDER.STRIPE,
    'pi_test_123',
    1,
    PAYMENT_TYPE.RESERVATION,
    3,
    null,
    null,
    overrides.id ?? 42,
    new Date('2026-06-10T10:00:00.000Z'),
    new Date('2026-06-10T14:30:00.000Z'),
    overrides.invoiceNotificationsSentAt ?? null,
  );
}
