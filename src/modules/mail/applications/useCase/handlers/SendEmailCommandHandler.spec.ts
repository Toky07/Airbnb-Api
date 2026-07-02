import { describe, expect, it, vi } from 'vitest';
import { EMAIL_STATUS } from '../../../domain/constants/email-status.constant';
import { SendEmailCommandHandler } from './SendEmailCommandHandler';
import { SendEmailCommand } from '../commands/SendEmailCommand';
import {
  createAttachmentStorageMock,
  createEmailRepositoryMock,
  createMailTransportMock,
} from '../email-test.helpers';

describe('SendEmailCommandHandler', () => {
  it('enregistre un email envoyé avec succès', async () => {
    const transport = createMailTransportMock();
    const handler = new SendEmailCommandHandler(
      createEmailRepositoryMock(),
      transport,
      createAttachmentStorageMock(),
    );

    const result = await handler.execute(new SendEmailCommand({
      to: 'client@test.com',
      subject: 'Bienvenue',
      body: 'Bonjour',
      sourceModule: 'test',
    }));

    expect(result.status).toBe(EMAIL_STATUS.SENT);
    expect(transport.send).toHaveBeenCalledTimes(1);
  });

  it('enregistre un échec si le transport échoue', async () => {
    const transport = createMailTransportMock(
      vi.fn().mockRejectedValue(new Error('SMTP down')),
    );
    const handler = new SendEmailCommandHandler(
      createEmailRepositoryMock(),
      transport,
      createAttachmentStorageMock(),
    );

    const result = await handler.execute(new SendEmailCommand({
      to: 'client@test.com',
      subject: 'Erreur',
      body: 'Test',
    }));

    expect(result.status).toBe(EMAIL_STATUS.FAILED);
    expect(result.errorMessage).toBe('SMTP down');
  });

  it('refuse un envoi sans destinataire', async () => {
    const handler = new SendEmailCommandHandler(
      createEmailRepositoryMock(),
      createMailTransportMock(),
      createAttachmentStorageMock(),
    );

    await expect(
      handler.execute(new SendEmailCommand({
        to: '   ',
        subject: 'Sans destinataire',
        body: 'Test',
      })),
    ).rejects.toThrow('At least one recipient is required');
  });
});
