export class SyncStripeConnectAccountCommand {
  constructor(
    public readonly stripeAccountId: string,
    public readonly chargesEnabled: boolean,
    public readonly payoutsEnabled: boolean,
    public readonly deauthorized = false,
  ) {}
}
