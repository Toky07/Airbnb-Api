import { describe, expect, it, vi } from 'vitest';
import { EMAIL_STATUS } from '../../domain/constants/email-status.constant';
import { Email } from '../../domain/entities/email.entity';
import { deliverEmail } from './deliver-email';
import {
  createEmailRepositoryMock,
  createMailTransportMock,
} from '../useCase/email-test.helpers';

describe('deliverEmail', () => {
  it('marque l’email comme envoyé après un transport réussi', async () => {
    const repository = createEmailRepositoryMock();
    const transport = createMailTransportMock();
    const email = new Email(
      ['client@test.com'],
      'Sujet',
      'Corps',
      EMAIL_STATUS.PENDING,
      [],
      [],
      false,
      'test',
      null,
      null,
      null,
      [],
      1,
      new Date(),
      new Date(),
    );

    const result = await deliverEmail(repository, transport, email);

    expect(result.status).toBe(EMAIL_STATUS.SENT);
    expect(result.sentAt).toBeInstanceOf(Date);
  });

  it('marque l’email comme échoué si le transport échoue', async () => {
    const repository = createEmailRepositoryMock();
    const transport = createMailTransportMock(
      vi.fn().mockRejectedValue(new Error('Transport error')),
    );
    const email = new Email(
      ['client@test.com'],
      'Sujet',
      'Corps',
      EMAIL_STATUS.PENDING,
      [],
      [],
      false,
      'test',
      null,
      null,
      null,
      [],
      1,
      new Date(),
      new Date(),
    );

    const result = await deliverEmail(repository, transport, email);

    expect(result.status).toBe(EMAIL_STATUS.FAILED);
    expect(result.errorMessage).toBe('Transport error');
  });
});
