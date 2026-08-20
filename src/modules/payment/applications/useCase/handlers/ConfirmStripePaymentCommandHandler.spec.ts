import { ConfirmStripePaymentCommandHandler } from './ConfirmStripePaymentCommandHandler';
import { ConfirmStripePaymentCommand } from '@src/modules/payment/applications/useCase/commands/ConfirmStripePaymentCommand';
import { MapStripeStatusService } from '@src/modules/payment/applications/services/map-stripe-status.service';
import { Payment } from '@src/modules/payment/domain/entities/payment.entity';
import { PAYMENT_STATUS } from '@src/modules/payment/domain/constants/payment-status.constant';
import { PAYMENT_TYPE } from '@src/modules/payment/domain/types/payment.type';
import type { IPaymentRepository } from '@src/modules/payment/domain/repositories/payment.repository';
import type { IWebhookVerifier } from '@src/modules/payment/domain/ports/webhook-verifier.port';

const mockPublish = vi.fn();
vi.mock('../../../../../shared/domain/event.bus', () => ({
  EventBus: { getInstance: () => ({ publish: mockPublish }) },
}));

const makePayment = () =>
  Payment.create({
    amount: 100,
    currency: 'eur',
    status: PAYMENT_STATUS.PENDING,
    provider: 'stripe',
    transactionId: 'pi_123',
    userId: 1,
    propertyType: PAYMENT_TYPE.RESERVATION,
    propertyId: 1,
  });

function createHandler(
  overrides: {
    findByTransactionId?: ReturnType<typeof vi.fn>;
    update?: ReturnType<typeof vi.fn>;
    verify?: ReturnType<typeof vi.fn>;
    fromWebhookEventType?: ReturnType<typeof vi.fn>;
    syncStripeConnectAccount?: { execute: ReturnType<typeof vi.fn> };
  } = {},
) {
  const payment = makePayment();

  const repository = {
    findByTransactionId:
      overrides.findByTransactionId ?? vi.fn().mockResolvedValue(payment),
    update:
      overrides.update ??
      vi.fn().mockImplementation((p: Payment) => Promise.resolve(p)),
  } as unknown as IPaymentRepository;

  const webhookVerifier = {
    verify:
      overrides.verify ??
      vi.fn().mockReturnValue({
        type: 'payment_intent.succeeded',
        paymentIntentId: 'pi_123',
        status: 'succeeded',
        errorMessage: null,
      }),
  } as IWebhookVerifier;

  const mapStripeStatus = overrides.fromWebhookEventType
    ? ({
        fromWebhookEventType: overrides.fromWebhookEventType,
      } as unknown as MapStripeStatusService)
    : new MapStripeStatusService();

  const handler = new ConfirmStripePaymentCommandHandler(
    repository,
    mapStripeStatus,
    webhookVerifier,
    undefined,
    overrides.syncStripeConnectAccount as never,
  );

  return { handler, repository, webhookVerifier, payment };
}

describe('ConfirmStripePaymentCommandHandler', () => {
  const validPayload = Buffer.from('webhook-body');
  const validSignature = 'whsec_test_signature';

  beforeEach(() => vi.clearAllMocks());

  it('should throw when payload is empty', async () => {
    const { handler } = createHandler();
    await expect(
      handler.execute(
        new ConfirmStripePaymentCommand(Buffer.alloc(0), validSignature),
      ),
    ).rejects.toThrow('Corps de webhook vide.');
  });

  it('should throw when signature is missing', async () => {
    const { handler } = createHandler();
    await expect(
      handler.execute(new ConfirmStripePaymentCommand(validPayload, '')),
    ).rejects.toThrow('Signature Stripe manquante.');
  });

  it('should call webhookVerifier.verify with payload and signature', async () => {
    const { handler, webhookVerifier } = createHandler();
    await handler.execute(
      new ConfirmStripePaymentCommand(validPayload, validSignature),
    );
    expect(webhookVerifier.verify).toHaveBeenCalledWith(
      validPayload,
      validSignature,
    );
  });

  it('should throw when payment is not found', async () => {
    const { handler } = createHandler({
      findByTransactionId: vi.fn().mockResolvedValue(null),
    });
    await expect(
      handler.execute(
        new ConfirmStripePaymentCommand(validPayload, validSignature),
      ),
    ).rejects.toThrow('Paiement introuvable pour cet événement.');
  });

  it('should look up the payment by paymentIntentId', async () => {
    const { handler, repository } = createHandler();
    await handler.execute(
      new ConfirmStripePaymentCommand(validPayload, validSignature),
    );
    expect(repository.findByTransactionId).toHaveBeenCalledWith('pi_123');
  });

  it('should update the payment with the mapped status', async () => {
    const { handler, repository } = createHandler();
    await handler.execute(
      new ConfirmStripePaymentCommand(validPayload, validSignature),
    );
    expect(repository.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: PAYMENT_STATUS.SUCCEEDED }),
    );
  });

  it('should return the updated payment', async () => {
    const { handler } = createHandler();
    const result = await handler.execute(
      new ConfirmStripePaymentCommand(validPayload, validSignature),
    );
    expect(result).toBeInstanceOf(Payment);
    expect(result.status).toBe(PAYMENT_STATUS.SUCCEEDED);
  });

  it('should publish PaymentConfirmedEvent when status is SUCCEEDED', async () => {
    const { handler } = createHandler();
    await handler.execute(
      new ConfirmStripePaymentCommand(validPayload, validSignature),
    );
    expect(mockPublish).toHaveBeenCalledOnce();
  });

  it('should NOT publish event when status is FAILED', async () => {
    const { handler } = createHandler({
      fromWebhookEventType: vi.fn().mockReturnValue(PAYMENT_STATUS.FAILED),
    });
    await handler.execute(
      new ConfirmStripePaymentCommand(validPayload, validSignature),
    );
    expect(mockPublish).not.toHaveBeenCalled();
  });

  it('should NOT publish event when status is CANCELED', async () => {
    const { handler } = createHandler({
      fromWebhookEventType: vi.fn().mockReturnValue(PAYMENT_STATUS.CANCELED),
    });
    await handler.execute(
      new ConfirmStripePaymentCommand(validPayload, validSignature),
    );
    expect(mockPublish).not.toHaveBeenCalled();
  });

  it('synchronise le compte Connect sur account.updated', async () => {
    const syncStripeConnectAccount = {
      execute: vi.fn().mockResolvedValue(undefined),
    };
    const { handler, repository } = createHandler({
      verify: vi.fn().mockReturnValue({
        type: 'account.updated',
        paymentIntentId: null,
        status: '',
        accountId: 'acct_1',
        chargesEnabled: true,
        payoutsEnabled: true,
      }),
      syncStripeConnectAccount,
    });

    const result = await handler.execute(
      new ConfirmStripePaymentCommand(validPayload, validSignature),
    );

    expect(syncStripeConnectAccount.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        stripeAccountId: 'acct_1',
        chargesEnabled: true,
        payoutsEnabled: true,
        deauthorized: false,
      }),
    );
    expect(repository.findByTransactionId).not.toHaveBeenCalled();
    expect(result).toEqual({ received: true });
  });
});
