import { Injectable } from '@nestjs/common';
import type {
  CreateAccountLinkParams,
  CreateExpressAccountParams,
  IStripeConnectAccounts,
  StripeConnectAccountSnapshot,
} from '@src/modules/payment/domain/ports/stripe-connect-accounts.port';
import { StripeClientProvider } from './StripeClientProvider';

@Injectable()
export class StripeConnectAccountsAdapter implements IStripeConnectAccounts {
  constructor(private readonly stripeClientProvider: StripeClientProvider) {}

  async createExpressAccount(
    params: CreateExpressAccountParams,
  ): Promise<StripeConnectAccountSnapshot> {
    const account = await this.stripeClientProvider.stripe.accounts.create({
      type: 'express',
      country: params.country,
      email: params.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    return this.toSnapshot(account);
  }

  async retrieveAccount(
    accountId: string,
  ): Promise<StripeConnectAccountSnapshot> {
    const account =
      await this.stripeClientProvider.stripe.accounts.retrieve(accountId);
    return this.toSnapshot(account);
  }

  async createAccountLink(
    params: CreateAccountLinkParams,
  ): Promise<{ url: string }> {
    const link = await this.stripeClientProvider.stripe.accountLinks.create({
      account: params.accountId,
      refresh_url: params.refreshUrl,
      return_url: params.returnUrl,
      type: 'account_onboarding',
    });

    return { url: link.url };
  }

  async createLoginLink(accountId: string): Promise<{ url: string }> {
    const link =
      await this.stripeClientProvider.stripe.accounts.createLoginLink(
        accountId,
      );

    return { url: link.url };
  }

  private toSnapshot(account: {
    id: string;
    charges_enabled?: boolean | null;
    payouts_enabled?: boolean | null;
    details_submitted?: boolean | null;
  }): StripeConnectAccountSnapshot {
    return {
      id: account.id,
      chargesEnabled: Boolean(account.charges_enabled),
      payoutsEnabled: Boolean(account.payouts_enabled),
      detailsSubmitted: Boolean(account.details_submitted),
    };
  }
}
