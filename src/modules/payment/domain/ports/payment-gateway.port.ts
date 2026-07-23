export const PAYMENT_GATEWAY = 'PAYMENT_GATEWAY';

export type CreatePaymentIntentParams = {
  amount: number;
  currency: string;
  metadata: Record<string, string>;
};

export type PaymentIntentSnapshot = {
  id: string;
  clientSecret: string | null;
  status: string;
};

export type RefundSnapshot = {
  id: string;
};

export type WebhookEventPayload = {
  type: string;
  paymentIntentId: string;
  status: string;
  errorMessage?: string | null;
};

export interface IPaymentGateway {
  createPaymentIntent(
    params: CreatePaymentIntentParams,
  ): Promise<PaymentIntentSnapshot>;

  retrievePaymentIntent(id: string): Promise<PaymentIntentSnapshot>;

  createRefund(
    paymentIntentId: string,
    amount: number,
  ): Promise<RefundSnapshot>;
}
