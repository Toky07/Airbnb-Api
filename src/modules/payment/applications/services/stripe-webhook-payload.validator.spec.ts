import { describe, expect, it } from 'vitest';
import { StripeWebhookPayloadValidator } from './stripe-webhook-payload.validator';

describe('StripeWebhookPayloadValidator', () => {
  const validator = new StripeWebhookPayloadValidator();

  it('accepts a valid payload and signature', () => {
    expect(() => validator.validate(Buffer.from('body'), 'sig_test')).not.toThrow();
  });

  it('rejects an empty payload', () => {
    expect(() => validator.validate(Buffer.alloc(0), 'sig_test')).toThrow(
      'Corps de webhook vide.',
    );
  });

  it('rejects a missing signature', () => {
    expect(() => validator.validate(Buffer.from('body'), '')).toThrow(
      'Signature Stripe manquante.',
    );
  });
});
