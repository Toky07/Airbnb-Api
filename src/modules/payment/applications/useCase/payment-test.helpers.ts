import { vi } from 'vitest';
import { PAYMENT_PROVIDER } from '../../domain/constants/payment-provider.constant';
import { PAYMENT_STATUS } from '../../domain/constants/payment-status.constant';
import { Payment } from '../../domain/entities/payment.entity';
import type { IPaymentGateway } from '../../domain/ports/payment-gateway.port';
import type { IPaymentRepository } from '../../domain/repositories/payment.repository';

export function createSamplePayment(overrides: Partial<{
  id: number;
  transactionId: string;
  userId: number;
  status: (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];
}> = {}): Payment {
  return new Payment(
    20000,
    'eur',
    overrides.status ?? PAYMENT_STATUS.PENDING,
    PAYMENT_PROVIDER.STRIPE,
    overrides.transactionId ?? 'pi_test_123',
    overrides.userId ?? 1,
    10,
    '2026-06-10',
    '2026-06-12',
    2,
    2,
    null,
    null,
    overrides.id ?? 1,
    new Date('2026-06-01T10:00:00.000Z'),
    new Date('2026-06-01T10:00:00.000Z'),
  );
}

export function createPaymentRepositoryMock(
  overrides: Partial<IPaymentRepository> = {},
): IPaymentRepository {
  return {
    create: vi.fn().mockImplementation(async (payment: Payment) =>
      createSamplePayment({
        id: 1,
        transactionId: payment.transactionId,
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
    constructWebhookEvent: vi.fn().mockReturnValue({
      type: 'payment_intent.succeeded',
      paymentIntentId: 'pi_test_123',
      status: 'succeeded',
      errorMessage: null,
    }),
    retrievePaymentIntent: vi.fn(),
    ...overrides,
  } as unknown as IPaymentGateway;
}
