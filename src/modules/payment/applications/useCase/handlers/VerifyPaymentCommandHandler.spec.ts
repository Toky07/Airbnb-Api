import { VerifyPaymentCommandHandler } from './VerifyPaymentCommandHandler';
import { VerifyPaymentCommand } from '@src/modules/payment/applications/useCase/commands/VerifyPaymentCommand';
import { MapStripeStatusService } from '@src/modules/payment/applications/services/map-stripe-status.service';
import { PAYMENT_STATUS } from '@src/modules/payment/domain/constants/payment-status.constant';
import {
  createPaymentGatewayMock,
  createPaymentRepositoryMock,
  createSamplePayment,
} from '@src/modules/payment/applications/useCase/payment-test.helpers';

const mockPublish = vi.fn();
vi.mock('../../../../../shared/domain/event.bus', () => ({
  EventBus: { getInstance: () => ({ publish: mockPublish }) },
}));

function createHandler(
  overrides: {
    findById?: ReturnType<typeof vi.fn>;
    update?: ReturnType<typeof vi.fn>;
    retrievePaymentIntent?: ReturnType<typeof vi.fn>;
  } = {},
) {
  const payment = createSamplePayment({
    cartId: 5,
    status: PAYMENT_STATUS.PENDING,
  });

  const repository = createPaymentRepositoryMock({
    findById: overrides.findById ?? vi.fn().mockResolvedValue(payment),
    update: overrides.update ?? vi.fn().mockImplementation(async (p) => p),
  });

  const gateway = createPaymentGatewayMock({
    retrievePaymentIntent:
      overrides.retrievePaymentIntent ??
      vi.fn().mockResolvedValue({
        id: 'pi_test_123',
        status: 'succeeded',
      }),
  });

  const handler = new VerifyPaymentCommandHandler(
    repository,
    gateway,
    new MapStripeStatusService(),
  );

  return { handler, repository, gateway, payment };
}

describe('VerifyPaymentCommandHandler', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should throw when payment is not found', async () => {
    const { handler } = createHandler({
      findById: vi.fn().mockResolvedValue(null),
    });

    await expect(handler.execute(new VerifyPaymentCommand(99))).rejects.toThrow(
      'Paiement introuvable.',
    );
  });

  it('should throw when payment has no cartId', async () => {
    const { handler } = createHandler({
      findById: vi
        .fn()
        .mockResolvedValue(createSamplePayment({ cartId: null })),
    });

    await expect(handler.execute(new VerifyPaymentCommand(1))).rejects.toThrow(
      'Ce paiement ne correspond pas à un panier.',
    );
  });

  it('should return cartId when payment is already succeeded', async () => {
    const { handler } = createHandler({
      findById: vi
        .fn()
        .mockResolvedValue(
          createSamplePayment({ cartId: 5, status: PAYMENT_STATUS.SUCCEEDED }),
        ),
    });

    const result = await handler.execute(new VerifyPaymentCommand(1));

    expect(result).toEqual({ cartId: 5 });
    expect(mockPublish).not.toHaveBeenCalled();
  });

  it('should verify with gateway and update status when pending', async () => {
    const { handler, gateway, repository } = createHandler();

    const result = await handler.execute(new VerifyPaymentCommand(1));

    expect(gateway.retrievePaymentIntent).toHaveBeenCalledWith('pi_test_123');
    expect(repository.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: PAYMENT_STATUS.SUCCEEDED }),
    );
    expect(mockPublish).toHaveBeenCalledOnce();
    expect(result).toEqual({ cartId: 5 });
  });

  it('should throw when gateway reports payment not confirmed', async () => {
    const { handler } = createHandler({
      retrievePaymentIntent: vi.fn().mockResolvedValue({
        id: 'pi_test_123',
        status: 'requires_payment_method',
      }),
    });

    await expect(handler.execute(new VerifyPaymentCommand(1))).rejects.toThrow(
      "Le paiement n'est pas encore confirmé.",
    );
  });
});
