import { Injectable } from '@nestjs/common';
import type { IWebhookVerifier } from '../../domain/ports/webhook-verifier.port';
import type { WebhookEventPayload } from '../../domain/ports/payment-gateway.port';
import { StripeClientProvider } from './StripeClientProvider';
import { getStripeWebhookSecret } from './stripe.config';

@Injectable()
export class StripeWebhookVerifier implements IWebhookVerifier {
  constructor(private readonly stripeClientProvider: StripeClientProvider) {}

  verify(payload: Buffer, signature: string): WebhookEventPayload {
    const stripe = this.stripeClientProvider.stripe;
    const webhookSecret = getStripeWebhookSecret();

    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not configured.');
    }

    let event: unknown;

    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch {
      throw new Error('Signature Stripe invalide.');
    }

    const eventType = (event as { type?: string }).type ?? '';
    if (!eventType.startsWith('payment_intent.')) {
      throw new Error('Événement Stripe non pris en charge.');
    }

    const paymentIntent = (
      event as {
        data: {
          object: {
            id: string;
            status: string;
            last_payment_error?: { message?: string | null } | null;
          };
        };
      }
    ).data.object;

    return {
      type: eventType,
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
      errorMessage: paymentIntent.last_payment_error?.message ?? null,
    };
  }
}
