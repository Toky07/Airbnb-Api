import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import type {
  CreatePaymentIntentParams,
  IPaymentGateway,
  PaymentIntentSnapshot,
} from '../../domain/ports/payment-gateway.port';
import { StripeClientProvider } from './StripeClientProvider';

@Injectable()
export class StripePaymentGateway implements IPaymentGateway {
  private readonly stripe: Stripe.Stripe;

  constructor() {
    this.stripe = new StripeClientProvider().stripe;
  }

  async createPaymentIntent(
    params: CreatePaymentIntentParams,
  ): Promise<PaymentIntentSnapshot> {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: params.amount,
      currency: params.currency,
      automatic_payment_methods: { enabled: true },
      metadata: params.metadata,
    });

    return this.toSnapshot(paymentIntent);
  }

  async retrievePaymentIntent(id: string): Promise<PaymentIntentSnapshot> {
    const paymentIntent = await this.stripe.paymentIntents.retrieve(id);
    return this.toSnapshot(paymentIntent);
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
