import { describe, expect, it, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { EMAIL_STATUS } from '@src/modules/mail/domain/constants/email-status.constant';
import { Email } from '@src/modules/mail/domain/entities/email.entity';
import { GetEmailQueryHandler } from './GetEmailQueryHandler';
import { GetEmailQuery } from '@src/modules/mail/applications/useCase/queries/GetEmailQuery';
import { createEmailRepositoryMock } from '@src/modules/mail/applications/useCase/email-test.helpers';

describe('GetEmailQueryHandler', () => {
  it('retourne un email existant', async () => {
    const email = new Email(
      ['client@test.com'],
      'Sujet',
      'Corps',
      EMAIL_STATUS.SENT,
      [],
      [],
      false,
      'test',
      null,
      null,
      new Date(),
      [],
      42,
      new Date(),
      new Date(),
    );

    const repository = createEmailRepositoryMock({
      findById: vi.fn().mockResolvedValue(email),
    });

    const handler = new GetEmailQueryHandler(repository);
    const result = await handler.execute(new GetEmailQuery(42));

    expect(result.id).toBe(42);
    expect(result.subject).toBe('Sujet');
  });

  it('lève une erreur si l’email est introuvable', async () => {
    const repository = createEmailRepositoryMock({
      findById: vi.fn().mockResolvedValue(null),
    });

    const handler = new GetEmailQueryHandler(repository);

    await expect(handler.execute(new GetEmailQuery(99))).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
