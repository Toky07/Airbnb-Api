export type CreatePaymentResult = {
  paymentId: number;
  clientSecret: string | null;
  amount: number;
  currency: string;
  publishableKey: string;
};
