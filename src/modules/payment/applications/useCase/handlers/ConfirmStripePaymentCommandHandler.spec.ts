import { Payment } from "../../../domain/entities/payment.entity";
import { ConfirmStripePaymentCommandHandler } from "./ConfirmStripePaymentCommandHandler";
import { PAYMENT_STATUS } from "../../../domain/constants/payment-status.constant";
import { PAYMENT_TYPE } from "../../../domain/types/payment.type";
import { IPaymentRepository } from "../../../domain/repositories/payment.repository";
import { MapStripeStatusService } from "../../services/map-stripe-status.service";
import { StripeClientProvider } from "../../../infrastructure/stripe/StripeClientProvider";
import { ConfirmStripePaymentCommand } from "../commands/ConfirmStripePaymentCommand";
import { EventBus } from "../../../../../shared/domain/event.bus";
import { PaymentConfirmedEvent } from "../../../domain/events/payment-confirmed.event";
import { WebhookEventPayload } from "../../../domain/ports/payment-gateway.port";

vi.mock("../../../infrastructure/stripe/StripeWebhookVerifier", () => {
    return {
        StripeWebhookVerifier: class {
            verify = vi.fn();
        },
    };
});

const mockPublish = vi.fn();
vi.mock("../../../../../shared/domain/event.bus", () => ({
    EventBus: {
        getInstance: vi.fn(() => ({
            publish: mockPublish,
        })),
    },
}));

const makePayment = (overrides: Partial<Parameters<typeof Payment.create>[0]> = {}) =>
    Payment.create({
        amount: 100,
        currency: 'USD',
        status: PAYMENT_STATUS.PENDING,
        provider: 'stripe',
        transactionId: 'pi_123',
        userId: 1,
        propertyType: PAYMENT_TYPE.RESERVATION,
        propertyId: 1,
        ...overrides,
    });

const webhookEvent: WebhookEventPayload = {
    type: 'payment_intent.succeeded',
    paymentIntentId: 'pi_123',
    status: 'succeeded',
    errorMessage: null,
};

function createMocks(overrides: {
    findByTransactionId?: ReturnType<typeof vi.fn>;
    update?: ReturnType<typeof vi.fn>;
    fromWebhookEventType?: ReturnType<typeof vi.fn>;
    verifierVerify?: ReturnType<typeof vi.fn>;
} = {}) {
    const payment = makePayment();

    const repository = {
        findByTransactionId: overrides.findByTransactionId ?? vi.fn().mockResolvedValue(payment),
        update: overrides.update ?? vi.fn().mockImplementation((p: Payment) => Promise.resolve(p)),
    } as unknown as IPaymentRepository;

    const mapStripeStatus = {
        fromWebhookEventType: overrides.fromWebhookEventType ?? vi.fn().mockReturnValue(PAYMENT_STATUS.SUCCEEDED),
    } as unknown as MapStripeStatusService;

    const stripeClientProvider = {
        stripe: {},
    } as unknown as StripeClientProvider;

    const handler = new ConfirmStripePaymentCommandHandler(repository, mapStripeStatus, stripeClientProvider);

    const verifierVerify = overrides.verifierVerify ?? vi.fn().mockReturnValue(webhookEvent);
    (handler as any).stripeWebhookVerifier.verify = verifierVerify;

    return { handler, repository, mapStripeStatus, stripeClientProvider, verifierVerify, payment };
}

describe('ConfirmStripePaymentCommandHandler', () => {
    const validPayload = Buffer.from('webhook-body');
    const validSignature = 'whsec_test_signature';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('payload / signature validation', () => {
        it('should throw when payload is empty', async () => {
            const { handler } = createMocks();

            await expect(
                handler.execute(new ConfirmStripePaymentCommand(Buffer.alloc(0), validSignature)),
            ).rejects.toThrow('Corps de webhook vide.');
        });

        it('should throw when signature is missing', async () => {
            const { handler } = createMocks();

            await expect(
                handler.execute(new ConfirmStripePaymentCommand(validPayload, '')),
            ).rejects.toThrow('Signature Stripe manquante.');
        });

        it('should throw when signature is only whitespace', async () => {
            const { handler } = createMocks();

            await expect(
                handler.execute(new ConfirmStripePaymentCommand(validPayload, '   ')),
            ).rejects.toThrow('Signature Stripe manquante.');
        });
    });

    describe('webhook verification', () => {
        it('should call stripeWebhookVerifier.verify with stripe client, payload and signature', async () => {
            const { handler, verifierVerify, stripeClientProvider } = createMocks();

            await handler.execute(new ConfirmStripePaymentCommand(validPayload, validSignature));

            expect(verifierVerify).toHaveBeenCalledWith(
                stripeClientProvider.stripe,
                validPayload,
                validSignature,
            );
        });
    });

    describe('payment lookup', () => {
        it('should throw when payment is not found', async () => {
            const { handler } = createMocks({
                findByTransactionId: vi.fn().mockResolvedValue(null),
            });

            await expect(
                handler.execute(new ConfirmStripePaymentCommand(validPayload, validSignature)),
            ).rejects.toThrow('Paiement introuvable pour cet événement.');
        });

        it('should look up the payment by the paymentIntentId from the event', async () => {
            const { handler, repository } = createMocks();

            await handler.execute(new ConfirmStripePaymentCommand(validPayload, validSignature));

            expect(repository.findByTransactionId).toHaveBeenCalledWith('pi_123');
        });
    });

    describe('status mapping and update', () => {
        it('should map the webhook event type and status', async () => {
            const { handler, mapStripeStatus } = createMocks();

            await handler.execute(new ConfirmStripePaymentCommand(validPayload, validSignature));

            expect(mapStripeStatus.fromWebhookEventType).toHaveBeenCalledWith(
                'payment_intent.succeeded',
                'succeeded',
            );
        });

        it('should update the payment with the mapped status', async () => {
            const { handler, repository, payment } = createMocks({
                fromWebhookEventType: vi.fn().mockReturnValue(PAYMENT_STATUS.SUCCEEDED),
            });

            await handler.execute(new ConfirmStripePaymentCommand(validPayload, validSignature));

            expect(repository.update).toHaveBeenCalledWith(
                expect.objectContaining({ status: PAYMENT_STATUS.SUCCEEDED }),
            );
        });

        it('should return the updated payment', async () => {
            const { handler } = createMocks();

            const result = await handler.execute(
                new ConfirmStripePaymentCommand(validPayload, validSignature),
            );

            expect(result).toBeInstanceOf(Payment);
            expect(result.status).toBe(PAYMENT_STATUS.SUCCEEDED);
        });
    });

    describe('event publishing', () => {
        it('should publish PaymentConfirmedEvent when status is SUCCEEDED', async () => {
            const { handler } = createMocks({
                fromWebhookEventType: vi.fn().mockReturnValue(PAYMENT_STATUS.SUCCEEDED),
            });

            await handler.execute(new ConfirmStripePaymentCommand(validPayload, validSignature));

            expect(EventBus.getInstance().publish).toHaveBeenCalledWith(
                expect.any(PaymentConfirmedEvent),
            );
        });

        it('should NOT publish event when status is FAILED', async () => {
            const { handler } = createMocks({
                fromWebhookEventType: vi.fn().mockReturnValue(PAYMENT_STATUS.FAILED),
            });

            await handler.execute(new ConfirmStripePaymentCommand(validPayload, validSignature));

            expect(mockPublish).not.toHaveBeenCalled();
        });

        it('should NOT publish event when status is CANCELED', async () => {
            const { handler } = createMocks({
                fromWebhookEventType: vi.fn().mockReturnValue(PAYMENT_STATUS.CANCELED),
            });

            await handler.execute(new ConfirmStripePaymentCommand(validPayload, validSignature));

            expect(mockPublish).not.toHaveBeenCalled();
        });

        it('should NOT publish event when status is PROCESSING', async () => {
            const { handler } = createMocks({
                fromWebhookEventType: vi.fn().mockReturnValue(PAYMENT_STATUS.PROCESSING),
            });

            await handler.execute(new ConfirmStripePaymentCommand(validPayload, validSignature));

            expect(mockPublish).not.toHaveBeenCalled();
        });
    });
});
