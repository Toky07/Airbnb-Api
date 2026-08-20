import { describe, expect, it, vi } from 'vitest';
import { ServiceUnavailableException } from '@nestjs/common';
import { CommandBus } from '@src/shared/useCase/bus/bus';
import { SendEmailCommand } from '@src/modules/mail/applications/useCase/commands/SendEmailCommand';
import { SubmitContactMessageCommand } from '@src/modules/mail/applications/useCase/commands/SubmitContactMessageCommand';
import {
  CONTACT_MAIL_SOURCE,
  SubmitContactMessageCommandHandler,
} from './SubmitContactMessageCommandHandler';

describe('SubmitContactMessageCommandHandler', () => {
  it('envoie un email au support', async () => {
    vi.stubEnv('SUPPORT_EMAIL', 'support@airbnb.dev');
    const execute = vi
      .spyOn(CommandBus, 'execute')
      .mockResolvedValue({ id: 1 });

    const result = await new SubmitContactMessageCommandHandler().execute(
      new SubmitContactMessageCommand({
        name: 'Léa Martin',
        email: 'lea@test.com',
        subject: 'Question réservation',
        message: 'Bonjour, j’ai une question sur mon séjour.',
      }),
    );

    expect(result.accepted).toBe(true);
    expect(execute).toHaveBeenCalledTimes(1);
    const command = execute.mock.calls[0]?.[0] as SendEmailCommand;
    expect(command.options.to).toBe('support@airbnb.dev');
    expect(command.options.subject).toBe('[Contact] Question réservation');
    expect(command.options.sourceModule).toBe(CONTACT_MAIL_SOURCE);
    expect(command.options.body).toContain('lea@test.com');

    execute.mockRestore();
    vi.unstubAllEnvs();
  });

  it('refuse si SUPPORT_EMAIL est absent', async () => {
    vi.stubEnv('SUPPORT_EMAIL', '');
    vi.stubEnv('HOST_APPLICATION_NOTIFY_EMAIL', '');

    await expect(
      new SubmitContactMessageCommandHandler().execute(
        new SubmitContactMessageCommand({
          name: 'Léa Martin',
          email: 'lea@test.com',
          subject: 'Question réservation',
          message: 'Bonjour, j’ai une question sur mon séjour.',
        }),
      ),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);

    vi.unstubAllEnvs();
  });
});
