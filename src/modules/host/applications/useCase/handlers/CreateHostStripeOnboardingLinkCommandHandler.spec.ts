import { describe, expect, it, vi } from 'vitest';
import { UserNameVO } from '@src/modules/user/contracts';
import { EmailVO } from '@src/shared/valueObject/email.vo';
import { PhoneNumberVO } from '@src/shared/valueObject/phone.vo';
import { User } from '@src/modules/user/contracts';
import { STRIPE_CONNECT_ONBOARDING_STATUS } from '@src/modules/user/contracts';
import { CreateHostStripeOnboardingLinkCommand } from '@src/modules/host/applications/useCase/commands/CreateHostStripeOnboardingLinkCommand';
import { CreateHostStripeOnboardingLinkCommandHandler } from './CreateHostStripeOnboardingLinkCommandHandler';
import { authUser } from './host-test.helpers';

function createHost(overrides: Partial<User> = {}) {
  const user = new User(
    new UserNameVO('Jean'),
    new UserNameVO('Dupont'),
    new EmailVO('jean@example.com'),
    new PhoneNumberVO('+33612345678'),
    '',
    5,
  );
  Object.assign(user, overrides);
  return user;
}

describe('CreateHostStripeOnboardingLinkCommandHandler', () => {
  it('crée un compte Express puis un Account Link', async () => {
    const user = createHost();
    const resolveHostUser = {
      resolve: vi.fn().mockResolvedValue(user),
      update: vi.fn().mockImplementation(async (updated: User) => updated),
    };
    const stripeConnectAccounts = {
      createExpressAccount: vi.fn().mockResolvedValue({
        id: 'acct_new',
        chargesEnabled: false,
        payoutsEnabled: false,
        detailsSubmitted: false,
      }),
      createAccountLink: vi.fn().mockResolvedValue({
        url: 'https://connect.stripe.com/setup/s/example',
      }),
    };
    const handler = new CreateHostStripeOnboardingLinkCommandHandler(
      resolveHostUser as never,
      stripeConnectAccounts as never,
    );

    const result = await handler.execute(
      new CreateHostStripeOnboardingLinkCommand(authUser),
    );

    expect(stripeConnectAccounts.createExpressAccount).toHaveBeenCalledWith({
      email: 'jean@example.com',
      country: 'FR',
    });
    expect(user.stripeAccountId).toBe('acct_new');
    expect(user.stripeOnboardingStatus).toBe(
      STRIPE_CONNECT_ONBOARDING_STATUS.PENDING,
    );
    expect(result.url).toContain('connect.stripe.com');
  });

  it('réutilise un compte existant', async () => {
    const user = createHost({
      stripeAccountId: 'acct_existing',
      stripeOnboardingStatus: STRIPE_CONNECT_ONBOARDING_STATUS.PENDING,
    });
    user.stripeAccountId = 'acct_existing';
    user.stripeOnboardingStatus = STRIPE_CONNECT_ONBOARDING_STATUS.PENDING;
    const resolveHostUser = {
      resolve: vi.fn().mockResolvedValue(user),
      update: vi.fn(),
    };
    const stripeConnectAccounts = {
      createExpressAccount: vi.fn(),
      createAccountLink: vi.fn().mockResolvedValue({
        url: 'https://connect.stripe.com/setup/s/again',
      }),
    };
    const handler = new CreateHostStripeOnboardingLinkCommandHandler(
      resolveHostUser as never,
      stripeConnectAccounts as never,
    );

    await handler.execute(new CreateHostStripeOnboardingLinkCommand(authUser));

    expect(stripeConnectAccounts.createExpressAccount).not.toHaveBeenCalled();
    expect(stripeConnectAccounts.createAccountLink).toHaveBeenCalledWith(
      expect.objectContaining({ accountId: 'acct_existing' }),
    );
  });
});
