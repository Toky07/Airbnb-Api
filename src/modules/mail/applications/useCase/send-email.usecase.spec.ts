import { describe, expect, it, vi } from 'vitest';
import { EMAIL_STATUS } from '../../domain/constants/email-status.constant';
import { Email } from '../../domain/entities/email.entity';
import { SendEmailUseCase } from './send-email.usecase';
import {
  createAttachmentStorageMock,
  createEmailRepositoryMock,
  createMailTransportMock,
} from './email-test.helpers';

describe('SendEmailUseCase', () => {
  it('enregistre un email envoyé avec succès', async () => {
    const transport = createMailTransportMock();
    const useCase = new SendEmailUseCase(
      createEmailRepositoryMock(),
      transport,
      createAttachmentStorageMock(),
    );

    const result = await useCase.execute({
      to: 'client@test.com',
      subject: 'Bienvenue',
      body: 'Bonjour',
      sourceModule: 'test',
    });

    expect(result.status).toBe(EMAIL_STATUS.SENT);
    expect(transport.send).toHaveBeenCalledTimes(1);
  });

  it('enregistre un échec si le transport échoue', async () => {
    const transport = createMailTransportMock(
      vi.fn().mockRejectedValue(new Error('SMTP down')),
    );
    const useCase = new SendEmailUseCase(
      createEmailRepositoryMock(),
      transport,
      createAttachmentStorageMock(),
    );

    const result = await useCase.execute({
      to: 'client@test.com',
      subject: 'Erreur',
      body: 'Test',
    });

    expect(result.status).toBe(EMAIL_STATUS.FAILED);
    expect(result.errorMessage).toBe('SMTP down');
  });

  it('refuse un envoi sans destinataire', async () => {
    const useCase = new SendEmailUseCase(
      createEmailRepositoryMock(),
      createMailTransportMock(),
      createAttachmentStorageMock(),
    );

    await expect(
      useCase.execute({
        to: '   ',
        subject: 'Sans destinataire',
        body: 'Test',
      }),
    ).rejects.toThrow('At least one recipient is required');
  });
});
