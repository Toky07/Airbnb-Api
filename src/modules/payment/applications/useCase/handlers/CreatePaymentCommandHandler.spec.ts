import { CreatePaymentParams, Payment } from '../../../domain/entities/payment.entity';
import type { IPaymentRepository } from '../../../domain/repositories/payment.repository';
import type { IPaymentGateway } from '../../../domain/ports/payment-gateway.port';
import { CreatePaymentCommandHandler } from './CreatePaymentCommandHandler';
import { CreatePaymentCommand } from '../commands/CreatePaymentCommand';
import { PAYMENT_STATUS } from '../../../domain/constants/payment-status.constant';
import { PAYMENT_PROVIDER } from '../../../domain/constants/payment-provider.constant';
import { PAYMENT_TYPE } from '../../../domain/types/payment.type';

vi.mock("../../../../../shared/domain/event.bus", () => ({
    EventBus: {
        getInstance: vi.fn(() => ({
            publish: vi.fn(),
        })),
    },
}));

const data: CreatePaymentParams = {
    amount: 100,
    currency: 'USD',
    provider: PAYMENT_PROVIDER.STRIPE,
    userId: 1,
    propertyType: PAYMENT_TYPE.RESERVATION,
    propertyId: 1,
    cartId: 1,
};

const createdPayment = Payment.create({
    id: 1,
    status: PAYMENT_STATUS.PENDING,
    transactionId: 'pi_test_123',
    ...data,
});

const repository = {
    create: vi.fn().mockResolvedValue(createdPayment),
} as unknown as IPaymentRepository;

const paymentGateway = {
    createPaymentIntent: vi.fn().mockResolvedValue({
        id: 'pi_test_123',
        clientSecret: 'secret_123',
        status: 'requires_payment_method',
    }),
} as unknown as IPaymentGateway;

describe('CreatePaymentCommandHandler', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const command = new CreatePaymentCommand(
        data.amount, data.currency, data.provider, data.userId, data.propertyType, data.propertyId, data.cartId,
    );

    it('should create a payment intent via the gateway', async () => {
        const handler = new CreatePaymentCommandHandler(repository, paymentGateway);
        await handler.execute(command);

        expect(paymentGateway.createPaymentIntent).toHaveBeenCalledWith({
            amount: 100,
            currency: 'USD',
            metadata: {
                userId: '1',
                propertyType: 'reservation',
                propertyId: '1',
            },
        });
    });

    it('should save the payment with the transaction id from the gateway', async () => {
        const handler = new CreatePaymentCommandHandler(repository, paymentGateway);
        await handler.execute(command);

        expect(repository.create).toHaveBeenCalledWith(
            expect.objectContaining({
                amount: 100,
                currency: 'USD',
                provider: 'stripe',
                userId: 1,
                propertyType: 'reservation',
                propertyId: 1,
                transactionId: 'pi_test_123',
            }),
        );
    });

    it('should confirm the payment entity', () => {
        const payment = Payment.create({ ...data, status: PAYMENT_STATUS.PENDING });
        payment.confirm();
        expect(payment.status).toBe(PAYMENT_STATUS.SUCCEEDED);
    });

    it('should cancel the payment entity', () => {
        const payment = Payment.create({ ...data, status: PAYMENT_STATUS.PENDING });
        payment.cancel();
        expect(payment.status).toBe(PAYMENT_STATUS.CANCELED);
    });
});
