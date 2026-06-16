import { afterEach, describe, expect, it, vi } from 'vitest';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EventBus } from '../../../../shared/domain/event.bus';
import { PAYMENT_STATUS } from '../../domain/constants/payment-status.constant';
import { PaymentConfirmedEvent } from '../../domain/events/payment-confirmed.event';
import { MapStripeStatusService } from '../services/map-stripe-status.service';
import { HandleStripeWebhookUseCase } from './handle-stripe-webhook.usecase';
import {
  createPaymentGatewayMock,
  createPaymentRepositoryMock,
  createSamplePayment,
} from './payment-test.helpers';

describe('HandleStripeWebhookUseCase', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('met à jour le statut du paiement depuis un webhook Stripe', async () => {
    const payment = createSamplePayment({
      id: 3,
      transactionId: 'pi_webhook_123',
      status: PAYMENT_STATUS.PENDING,
    });

    const paymentRepository = createPaymentRepositoryMock({
      findByTransactionId: vi.fn().mockResolvedValue(payment),
      update: vi.fn().mockImplementation(async (updated) => updated),
    });
    const paymentGateway = createPaymentGatewayMock({
      constructWebhookEvent: vi.fn().mockReturnValue({
        type: 'payment_intent.succeeded',
        paymentIntentId: 'pi_webhook_123',
        status: 'succeeded',
        errorMessage: null,
      }),
    });
    const publishSpy = vi
      .spyOn(EventBus.getInstance(), 'publish')
      .mockResolvedValue(undefined);

    const useCase = new HandleStripeWebhookUseCase(
      paymentRepository,
      paymentGateway,
      new MapStripeStatusService(),
    );

    const result = await useCase.execute(
      Buffer.from('{"id":"evt_test"}'),
      'sig_test',
    );

    expect(result.status).toBe(PAYMENT_STATUS.SUCCEEDED);
    expect(paymentRepository.update).toHaveBeenCalled();
    expect(publishSpy).toHaveBeenCalledWith(expect.any(PaymentConfirmedEvent));
    expect(publishSpy.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({ paymentId: 3 }),
    );
  });

  it('publie payment.confirmed quand le webhook confirme le succès', async () => {
    const payment = createSamplePayment({
      id: 3,
      transactionId: 'pi_webhook_123',
      status: PAYMENT_STATUS.PENDING,
    });

    const paymentRepository = createPaymentRepositoryMock({
      findByTransactionId: vi.fn().mockResolvedValue(payment),
      update: vi.fn().mockImplementation(async (updated) => updated),
    });
    const publishSpy = vi
      .spyOn(EventBus.getInstance(), 'publish')
      .mockResolvedValue(undefined);

    const useCase = new HandleStripeWebhookUseCase(
      paymentRepository,
      createPaymentGatewayMock(),
      new MapStripeStatusService(),
    );

    await useCase.execute(Buffer.from('{}'), 'sig_test');

    expect(publishSpy).toHaveBeenCalledWith(
      expect.objectContaining({ paymentId: 3 }),
    );
  });

  it('rejette un webhook sans signature', async () => {
    const useCase = new HandleStripeWebhookUseCase(
      createPaymentRepositoryMock(),
      createPaymentGatewayMock(),
      new MapStripeStatusService(),
    );

    await expect(
      useCase.execute(Buffer.from('{}'), ''),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('lève une erreur si aucun paiement ne correspond', async () => {
    const useCase = new HandleStripeWebhookUseCase(
      createPaymentRepositoryMock({
        findByTransactionId: vi.fn().mockResolvedValue(null),
      }),
      createPaymentGatewayMock(),
      new MapStripeStatusService(),
    );

    await expect(
      useCase.execute(Buffer.from('{}'), 'sig_test'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
