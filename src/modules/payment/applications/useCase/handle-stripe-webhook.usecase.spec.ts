import { describe, expect, it, vi } from 'vitest';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PAYMENT_STATUS } from '../../domain/constants/payment-status.constant';
import { MapStripeStatusService } from '../services/map-stripe-status.service';
import { HandleStripeWebhookUseCase } from './handle-stripe-webhook.usecase';
import {
  createPaymentGatewayMock,
  createPaymentRepositoryMock,
  createSamplePayment,
} from './payment-test.helpers';

describe('HandleStripeWebhookUseCase', () => {
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
