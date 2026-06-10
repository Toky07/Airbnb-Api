import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import Stripe from 'stripe';
import type {
  CreatePaymentIntentParams,
  IPaymentGateway,
  PaymentIntentSnapshot,
  WebhookEventPayload,
} from '../../domain/ports/payment-gateway.port';
import {
  getStripeSecretKey,
  getStripeWebhookSecret,
} from './stripe.config';

type StripeClient = InstanceType<typeof Stripe>;

@Injectable()
export class StripePaymentGateway implements IPaymentGateway {
  private readonly stripe: StripeClient | null;

  constructor() {
    const secretKey = getStripeSecretKey();
    this.stripe = secretKey ? new Stripe(secretKey) : null;
  }

  async createPaymentIntent(
    params: CreatePaymentIntentParams,
  ): Promise<PaymentIntentSnapshot> {
    const stripe = this.requireStripe();

    const paymentIntent = await stripe.paymentIntents.create({
      amount: params.amount,
      currency: params.currency,
      automatic_payment_methods: { enabled: true },
      metadata: params.metadata,
    });

    return this.toSnapshot(paymentIntent);
  }

  constructWebhookEvent(payload: Buffer, signature: string): WebhookEventPayload {
    const stripe = this.requireStripe();
    const webhookSecret = getStripeWebhookSecret();

    if (!webhookSecret) {
      throw new InternalServerErrorException(
        'STRIPE_WEBHOOK_SECRET is not configured.',
      );
    }

    let event: unknown;

    try {
      event = stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );
    } catch {
      throw new BadRequestException('Signature Stripe invalide.');
    }

    const eventType = (event as { type?: string }).type ?? '';
    if (!eventType.startsWith('payment_intent.')) {
      throw new BadRequestException('Événement Stripe non pris en charge.');
    }

    const paymentIntent = (event as {
      data: {
        object: {
          id: string;
          status: string;
          last_payment_error?: { message?: string | null } | null;
        };
      };
    }).data.object;

    return {
      type: eventType,
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
      errorMessage: paymentIntent.last_payment_error?.message ?? null,
    };
  }

  async retrievePaymentIntent(id: string): Promise<PaymentIntentSnapshot> {
    const stripe = this.requireStripe();
    const paymentIntent = await stripe.paymentIntents.retrieve(id);
    return this.toSnapshot(paymentIntent);
  }

  private requireStripe(): StripeClient {
    if (!this.stripe) {
      throw new InternalServerErrorException(
        'STRIPE_SECRET_KEY is not configured.',
      );
    }

    return this.stripe;
  }

  private toSnapshot(paymentIntent: {
    id: string;
    client_secret: string | null;
    status: string;
  }): PaymentIntentSnapshot {
    return {
      id: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      status: paymentIntent.status,
    };
  }
}
