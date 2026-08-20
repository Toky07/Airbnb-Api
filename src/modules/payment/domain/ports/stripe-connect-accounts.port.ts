export const STRIPE_CONNECT_ACCOUNTS = 'STRIPE_CONNECT_ACCOUNTS';

export type StripeConnectAccountSnapshot = {
  id: string;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
};

export type CreateExpressAccountParams = {
  email: string;
  country?: string;
};

export type CreateAccountLinkParams = {
  accountId: string;
  refreshUrl: string;
  returnUrl: string;
};

export interface IStripeConnectAccounts {
  createExpressAccount(
    params: CreateExpressAccountParams,
  ): Promise<StripeConnectAccountSnapshot>;

  retrieveAccount(accountId: string): Promise<StripeConnectAccountSnapshot>;

  createAccountLink(params: CreateAccountLinkParams): Promise<{ url: string }>;

  createLoginLink(accountId: string): Promise<{ url: string }>;
}
