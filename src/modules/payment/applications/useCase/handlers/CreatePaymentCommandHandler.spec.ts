import { CreatePaymentCommandHandler } from './CreatePaymentCommandHandler';
import { CreatePaymentCommand } from '@src/modules/payment/applications/useCase/commands/CreatePaymentCommand';
import { Payment } from '@src/modules/payment/domain/entities/payment.entity';
import { PAYMENT_TYPE } from '@src/modules/payment/domain/types/payment.type';
import type { IPaymentRepository } from '@src/modules/payment/domain/repositories/payment.repository';
import type { IPaymentGateway } from '@src/modules/payment/domain/ports/payment-gateway.port';
import type { IPaymentPublicConfig } from '@src/modules/payment/domain/ports/payment-public-config.port';

const mockPublish = vi.fn();
vi.mock('../../../../../shared/domain/event.bus', () => ({
  EventBus: { getInstance: () => ({ publish: mockPublish }) },
}));

function createHandler() {
  const repository = {
    create: vi
      .fn()
      .mockImplementation(async (p: Payment) =>
        Payment.create({ ...p, id: 1 }),
      ),
  } as unknown as IPaymentRepository;

  const gateway = {
    createPaymentIntent: vi.fn().mockResolvedValue({
      id: 'pi_test_123',
      clientSecret: 'pi_test_123_secret',
      status: 'requires_payment_method',
    }),
  } as unknown as IPaymentGateway;

  const paymentPublicConfig = {
    getPublishableKey: vi.fn().mockReturnValue('pk_test_mock'),
  } as unknown as IPaymentPublicConfig;

  const handler = new CreatePaymentCommandHandler(
    repository,
    gateway,
    paymentPublicConfig,
  );

  return { handler, repository, gateway, paymentPublicConfig };
}

const command = new CreatePaymentCommand(
  10000,
  'eur',
  'stripe',
  1,
  PAYMENT_TYPE.RESERVATION,
  42,
  5,
);

describe('CreatePaymentCommandHandler', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should create a payment intent via the gateway', async () => {
    const { handler, gateway } = createHandler();
    await handler.execute(command);

    expect(gateway.createPaymentIntent).toHaveBeenCalledWith({
      amount: 10000,
      currency: 'eur',
      metadata: { userId: '1', propertyType: 'reservation', propertyId: '42' },
    });
  });

  it('should save the payment with transactionId and cartId', async () => {
    const { handler, repository } = createHandler();
    await handler.execute(command);

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 10000,
        currency: 'eur',
        provider: 'stripe',
        transactionId: 'pi_test_123',
        cartId: 5,
      }),
    );
  });

  it('should publish PaymentCreatedEvent', async () => {
    const { handler } = createHandler();
    await handler.execute(command);

    expect(mockPublish).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: 'payment.created',
        paymentId: 1,
        propertyType: 'reservation',
        propertyId: 42,
      }),
    );
  });

  it('should return paymentId, clientSecret, amount, currency, publishableKey', async () => {
    const { handler, paymentPublicConfig } = createHandler();
    const result = await handler.execute(command);

    expect(paymentPublicConfig.getPublishableKey).toHaveBeenCalled();
    expect(result).toEqual({
      paymentId: 1,
      clientSecret: 'pi_test_123_secret',
      amount: 10000,
      currency: 'eur',
      publishableKey: 'pk_test_mock',
    });
  });

  it('passe destination Connect et application_fee au gateway', async () => {
    const { handler, gateway } = createHandler();
    await handler.execute(
      new CreatePaymentCommand(
        10000,
        'eur',
        'stripe',
        1,
        PAYMENT_TYPE.RESERVATION,
        42,
        5,
        null,
        'acct_host_1',
        1205,
        7,
      ),
    );

    expect(gateway.createPaymentIntent).toHaveBeenCalledWith({
      amount: 10000,
      currency: 'eur',
      metadata: {
        userId: '1',
        propertyType: 'reservation',
        propertyId: '42',
        hostUserId: '7',
        stripeAccountId: 'acct_host_1',
      },
      transferDestination: 'acct_host_1',
      applicationFeeAmount: 1205,
    });
  });
});
