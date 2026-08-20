import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { UserNameVO } from '@src/modules/user/contracts';
import { EmailVO } from '@src/shared/valueObject/email.vo';
import { PhoneNumberVO } from '@src/shared/valueObject/phone.vo';
import { User } from '@src/modules/user/contracts';
import { CreateHostStripeDashboardLinkCommand } from '@src/modules/host/applications/useCase/commands/CreateHostStripeDashboardLinkCommand';
import { CreateHostStripeDashboardLinkCommandHandler } from './CreateHostStripeDashboardLinkCommandHandler';
import { authUser } from './host-test.helpers';

describe('CreateHostStripeDashboardLinkCommandHandler', () => {
  it('ouvre le dashboard Express', async () => {
    const user = new User(
      new UserNameVO('Jean'),
      new UserNameVO('Dupont'),
      new EmailVO('jean@example.com'),
      new PhoneNumberVO('+33612345678'),
      '',
      5,
    );
    user.stripeAccountId = 'acct_existing';
    const handler = new CreateHostStripeDashboardLinkCommandHandler(
      { resolve: vi.fn().mockResolvedValue(user) } as never,
      {
        createLoginLink: vi.fn().mockResolvedValue({
          url: 'https://connect.stripe.com/express/acct',
        }),
      } as never,
    );

    const result = await handler.execute(
      new CreateHostStripeDashboardLinkCommand(authUser),
    );

    expect(result.url).toContain('connect.stripe.com');
  });

  it('refuse sans compte Connect', async () => {
    const user = new User(
      new UserNameVO('Jean'),
      new UserNameVO('Dupont'),
      new EmailVO('jean@example.com'),
      new PhoneNumberVO('+33612345678'),
      '',
      5,
    );
    const handler = new CreateHostStripeDashboardLinkCommandHandler(
      { resolve: vi.fn().mockResolvedValue(user) } as never,
      { createLoginLink: vi.fn() } as never,
    );

    await expect(
      handler.execute(new CreateHostStripeDashboardLinkCommand(authUser)),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
