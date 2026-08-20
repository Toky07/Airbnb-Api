export const PAYMENT_GATEWAY = 'PAYMENT_GATEWAY';

export type CreatePaymentIntentParams = {
  amount: number;
  currency: string;
  metadata: Record<string, string>;
  applicationFeeAmount?: number;
  transferDestination?: string;
};

export type PaymentIntentSnapshot = {
  id: string;
  clientSecret: string | null;
  status: string;
};

export type RefundSnapshot = {
  id: string;
};

export type CreateRefundParams = {
  refundApplicationFee?: boolean;
};

export type WebhookEventPayload = {
  type: string;
  paymentIntentId: string | null;
  status: string;
  errorMessage?: string | null;
  accountId?: string | null;
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
  detailsSubmitted?: boolean;
};

export interface IPaymentGateway {
  createPaymentIntent(
    params: CreatePaymentIntentParams,
  ): Promise<PaymentIntentSnapshot>;

  retrievePaymentIntent(id: string): Promise<PaymentIntentSnapshot>;

  createRefund(
    paymentIntentId: string,
    amount: number,
    options?: CreateRefundParams,
  ): Promise<RefundSnapshot>;
}
