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
  constructWebhookEvent(
    payload: Buffer,
    signature: string,
  ): WebhookEventPayload;
  retrievePaymentIntent(id: string): Promise<PaymentIntentSnapshot>;
}
