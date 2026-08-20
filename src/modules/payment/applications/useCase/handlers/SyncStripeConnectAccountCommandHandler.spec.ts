import { describe, expect, it, vi } from 'vitest';
import { STRIPE_CONNECT_ONBOARDING_STATUS } from '@src/modules/user/contracts';
import { UserNameVO } from '@src/modules/user/contracts';
import { EmailVO } from '@src/shared/valueObject/email.vo';
import { PhoneNumberVO } from '@src/shared/valueObject/phone.vo';
import { User } from '@src/modules/user/contracts';
import { SyncStripeConnectAccountCommand } from '@src/modules/payment/applications/useCase/commands/SyncStripeConnectAccountCommand';
import { SyncStripeConnectAccountCommandHandler } from './SyncStripeConnectAccountCommandHandler';

function createHost() {
  const user = new User(
    new UserNameVO('Jean'),
    new UserNameVO('Hôte'),
    new EmailVO('host@test.com'),
    new PhoneNumberVO('+33601020304'),
    '',
    8,
  );
  user.stripeAccountId = 'acct_test_1';
  user.stripeOnboardingStatus = STRIPE_CONNECT_ONBOARDING_STATUS.PENDING;
  return user;
}

describe('SyncStripeConnectAccountCommandHandler', () => {
  it('marque le compte Connect comme complet quand charges_enabled', async () => {
    const user = createHost();
    const userRepository = {
      findByStripeAccountId: vi.fn().mockResolvedValue(user),
      update: vi.fn().mockResolvedValue(user),
    };
    const handler = new SyncStripeConnectAccountCommandHandler(
      userRepository as never,
    );

    await handler.execute(
      new SyncStripeConnectAccountCommand('acct_test_1', true, true),
    );

    expect(user.stripeChargesEnabled).toBe(true);
    expect(user.stripePayoutsEnabled).toBe(true);
    expect(user.stripeOnboardingStatus).toBe(
      STRIPE_CONNECT_ONBOARDING_STATUS.COMPLETE,
    );
    expect(userRepository.update).toHaveBeenCalledWith(user);
  });

  it('réinitialise le compte en cas de révocation', async () => {
    const user = createHost();
    user.stripeChargesEnabled = true;
    const userRepository = {
      findByStripeAccountId: vi.fn().mockResolvedValue(user),
      update: vi.fn().mockResolvedValue(user),
    };
    const handler = new SyncStripeConnectAccountCommandHandler(
      userRepository as never,
    );

    await handler.execute(
      new SyncStripeConnectAccountCommand('acct_test_1', false, false, true),
    );

    expect(user.stripeAccountId).toBeNull();
    expect(user.stripeOnboardingStatus).toBe(
      STRIPE_CONNECT_ONBOARDING_STATUS.NOT_STARTED,
    );
  });

  it('ignore un compte inconnu', async () => {
    const userRepository = {
      findByStripeAccountId: vi.fn().mockResolvedValue(null),
      update: vi.fn(),
    };
    const handler = new SyncStripeConnectAccountCommandHandler(
      userRepository as never,
    );

    await handler.execute(
      new SyncStripeConnectAccountCommand('acct_unknown', true, true),
    );

    expect(userRepository.update).not.toHaveBeenCalled();
  });
});
