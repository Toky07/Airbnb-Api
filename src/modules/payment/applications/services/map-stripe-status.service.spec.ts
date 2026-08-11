import { describe, expect, it } from 'vitest';
import { PAYMENT_STATUS } from '@src/modules/payment/domain/constants/payment-status.constant';
import { MapStripeStatusService } from './map-stripe-status.service';

describe('MapStripeStatusService', () => {
  const service = new MapStripeStatusService();

  it('mappe payment_intent.succeeded vers succeeded', () => {
    expect(
      service.fromWebhookEventType('payment_intent.succeeded', 'succeeded'),
    ).toBe(PAYMENT_STATUS.SUCCEEDED);
  });

  it('mappe payment_intent.canceled vers canceled', () => {
    expect(
      service.fromWebhookEventType('payment_intent.canceled', 'canceled'),
    ).toBe(PAYMENT_STATUS.CANCELED);
  });

  it('mappe payment_intent.payment_failed vers failed', () => {
    expect(
      service.fromWebhookEventType(
        'payment_intent.payment_failed',
        'requires_payment_method',
      ),
    ).toBe(PAYMENT_STATUS.FAILED);
  });

  it('mappe processing pour un statut Stripe intermédiaire', () => {
    expect(service.fromPaymentIntentStatus('processing')).toBe(
      PAYMENT_STATUS.PROCESSING,
    );
  });
});
