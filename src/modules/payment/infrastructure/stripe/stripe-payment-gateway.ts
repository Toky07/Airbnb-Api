import { Injectable } from '@nestjs/common';
import type {
  CreatePaymentIntentParams,
  CreateRefundParams,
  IPaymentGateway,
  PaymentIntentSnapshot,
} from '@src/modules/payment/domain/ports/payment-gateway.port';
import { StripeClientProvider } from './StripeClientProvider';

@Injectable()
export class StripePaymentGateway implements IPaymentGateway {
  constructor(private readonly stripeClientProvider: StripeClientProvider) {}

  async createPaymentIntent(
    params: CreatePaymentIntentParams,
  ): Promise<PaymentIntentSnapshot> {
    const paymentIntent =
      await this.stripeClientProvider.stripe.paymentIntents.create({
        amount: params.amount,
        currency: params.currency,
        automatic_payment_methods: { enabled: true },
        metadata: params.metadata,
        ...(params.transferDestination
          ? {
              transfer_data: { destination: params.transferDestination },
            }
          : {}),
        ...(params.applicationFeeAmount != null &&
        params.applicationFeeAmount > 0
          ? { application_fee_amount: params.applicationFeeAmount }
          : {}),
      });

    return this.toSnapshot(paymentIntent);
  }

  async retrievePaymentIntent(id: string): Promise<PaymentIntentSnapshot> {
    const paymentIntent =
      await this.stripeClientProvider.stripe.paymentIntents.retrieve(id);
    return this.toSnapshot(paymentIntent);
  }

  async createRefund(
    paymentIntentId: string,
    amount: number,
    options?: CreateRefundParams,
  ): Promise<{ id: string }> {
    const refund = await this.stripeClientProvider.stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount,
      ...(options?.refundApplicationFee
        ? { refund_application_fee: true }
        : {}),
    });

    return { id: refund.id };
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
