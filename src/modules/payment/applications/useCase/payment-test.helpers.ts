import { vi } from 'vitest';
import { PAYMENT_PROVIDER } from '@src/modules/payment/domain/constants/payment-provider.constant';
import { PAYMENT_STATUS } from '@src/modules/payment/domain/constants/payment-status.constant';
import { Payment } from '@src/modules/payment/domain/entities/payment.entity';
import type { IPaymentGateway } from '@src/modules/payment/domain/ports/payment-gateway.port';
import type { IPaymentRepository } from '@src/modules/payment/domain/repositories/payment.repository';
import type { IWebhookVerifier } from '@src/modules/payment/domain/ports/webhook-verifier.port';
import { PAYMENT_TYPE } from '@src/modules/payment/domain/types/payment.type';

export function createSamplePayment(
  overrides: Partial<{
    id: number;
    transactionId: string;
    userId: number;
    status: (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];
    propertyId: number;
    cartId: number | null;
  }> = {},
): Payment {
  return Payment.create({
    amount: 20000,
    currency: 'eur',
    status: overrides.status ?? PAYMENT_STATUS.PENDING,
    provider: PAYMENT_PROVIDER.STRIPE,
    transactionId: overrides.transactionId ?? 'pi_test_123',
    userId: overrides.userId ?? 1,
    propertyType: PAYMENT_TYPE.RESERVATION,
    propertyId: overrides.propertyId ?? 1,
    cartId: overrides.cartId ?? null,
    id: overrides.id ?? 1,
    createdAt: new Date('2026-06-01T10:00:00.000Z'),
    updatedAt: new Date('2026-06-01T10:00:00.000Z'),
    invoiceNotificationsSentAt: null,
    errorMessage: null,
  });
}

export function createPaymentRepositoryMock(
  overrides: Partial<IPaymentRepository> = {},
): IPaymentRepository {
  return {
    create: vi.fn().mockImplementation(async (payment: Payment) =>
      createSamplePayment({
        id: 1,
        transactionId: payment.transactionId ?? undefined,
        userId: payment.userId,
        status: payment.status,
      }),
    ),
    update: vi.fn().mockImplementation(async (payment: Payment) => payment),
    findById: vi.fn(),
    findByTransactionId: vi.fn(),
    findPaginated: vi.fn(),
    ...overrides,
  } as unknown as IPaymentRepository;
}

export function createPaymentGatewayMock(
  overrides: Partial<IPaymentGateway> = {},
): IPaymentGateway {
  return {
    createPaymentIntent: vi.fn().mockResolvedValue({
      id: 'pi_test_123',
      clientSecret: 'pi_test_123_secret',
      status: 'requires_payment_method',
    }),
    retrievePaymentIntent: vi.fn(),
    createRefund: vi.fn().mockResolvedValue({ id: 're_test_123' }),
    ...overrides,
  };
}

export function createWebhookVerifierMock(
  overrides: Partial<IWebhookVerifier> = {},
): IWebhookVerifier {
  return {
    verify: vi.fn().mockReturnValue({
      type: 'payment_intent.succeeded',
      paymentIntentId: 'pi_test_123',
      status: 'succeeded',
      errorMessage: null,
    }),
    ...overrides,
  };
}
