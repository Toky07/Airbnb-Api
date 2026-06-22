import Stripe from "stripe";

export class StripeClientProvider {
    public readonly stripe: Stripe.Stripe;

    constructor() {
        const stripeSecretKey = process.env.STRIPE_SECRET_KEY?.trim() ?? ''
        this.stripe = new Stripe(stripeSecretKey);
    }
}
