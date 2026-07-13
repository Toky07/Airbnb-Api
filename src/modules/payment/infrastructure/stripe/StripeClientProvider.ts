import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { getStripeSecretKey } from './stripe.config';

@Injectable()
export class StripeClientProvider {
  private _stripe: Stripe.Stripe | null = null;

  get stripe(): Stripe.Stripe {
    if (!this._stripe) {
      const stripeSecretKey = getStripeSecretKey();
      this._stripe = new Stripe(stripeSecretKey);
    }
    return this._stripe;
  }
}
