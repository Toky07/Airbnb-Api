import { CreatePaymentCommandHandler } from './CreatePaymentCommandHandler';
import { CreatePaymentCommand } from '../commands/CreatePaymentCommand';
import { Payment } from '../../../domain/entities/payment.entity';
import { PAYMENT_STATUS } from '../../../domain/constants/payment-status.constant';
import { PAYMENT_TYPE } from '../../../domain/types/payment.type';
import type { IPaymentRepository } from '../../../domain/repositories/payment.repository';
import type { IPaymentGateway } from '../../../domain/ports/payment-gateway.port';

const mockPublish = vi.fn();
vi.mock('../../../../../shared/domain/event.bus', () => ({
  EventBus: { getInstance: () => ({ publish: mockPublish }) },
}));

vi.mock('../../../infrastructure/stripe/stripe.config', () => ({
  getStripePublishableKey: () => 'pk_test_mock',
}));

function createHandler() {
  const repository = {
    create: vi.fn().mockImplementation(async (p: Payment) =>
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

  const handler = new CreatePaymentCommandHandler(repository, gateway);

  return { handler, repository, gateway };
}

const command = new CreatePaymentCommand(
  10000, 'eur', 'stripe', 1, PAYMENT_TYPE.RESERVATION, 42, 5,
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
    const { handler } = createHandler();
    const result = await handler.execute(command);

    expect(result).toEqual({
      paymentId: 1,
      clientSecret: 'pi_test_123_secret',
      amount: 10000,
      currency: 'eur',
      publishableKey: 'pk_test_mock',
    });
  });
});
