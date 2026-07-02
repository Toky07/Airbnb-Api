import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeClientProvider {
  private _stripe: Stripe.Stripe | null = null;

  get stripe(): Stripe.Stripe {
    if (!this._stripe) {
      const stripeSecretKey = process.env.STRIPE_SECRET_KEY?.trim() ?? '';
      this._stripe = new Stripe(stripeSecretKey);
    }
    return this._stripe;
  }
}
