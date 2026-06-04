import { EMAIL_STATUS } from '../../domain/constants/email-status.constant';
import { Email } from '../../domain/entities/email.entity';
import type { IEmailRepository } from '../../domain/repositories/email.repository';
import type { IMailTransport } from '../../domain/ports/mail-transport.port';
import { EmailAttachmentStorageService } from '../../infrastructure/storage/email-attachment-storage.service';
import { SendEmailUseCase } from './email.usecase';

describe('SendEmailUseCase', () => {
  it('enregistre un email envoyé avec succès', async () => {
    const repository = {
      create: vi.fn().mockImplementation(async (email: Email) =>
        new Email(
          email.to,
          email.subject,
          email.body,
          email.status,
          email.cc,
          email.bcc,
          email.isHtml,
          email.sourceModule,
          email.sentByAuthId,
          email.errorMessage,
          email.sentAt,
          email.attachments,
          1,
          new Date(),
          new Date(),
        ),
      ),
      update: vi.fn().mockImplementation(async (email: Email) => email),
    } as unknown as IEmailRepository;

    const transport = {
      send: vi.fn().mockResolvedValue(undefined),
    } as unknown as IMailTransport;

    const attachmentStorage = {
      saveMany: vi.fn().mockResolvedValue([]),
    } as unknown as EmailAttachmentStorageService;

    const useCase = new SendEmailUseCase(repository, transport, attachmentStorage);
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
    const repository = {
      create: vi.fn().mockImplementation(async (email: Email) =>
        new Email(
          email.to,
          email.subject,
          email.body,
          email.status,
          email.cc,
          email.bcc,
          email.isHtml,
          email.sourceModule,
          email.sentByAuthId,
          email.errorMessage,
          email.sentAt,
          email.attachments,
          2,
          new Date(),
          new Date(),
        ),
      ),
      update: vi.fn().mockImplementation(async (email: Email) => email),
    } as unknown as IEmailRepository;

    const transport = {
      send: vi.fn().mockRejectedValue(new Error('SMTP down')),
    } as unknown as IMailTransport;

    const attachmentStorage = {
      saveMany: vi.fn().mockResolvedValue([]),
    } as unknown as EmailAttachmentStorageService;

    const useCase = new SendEmailUseCase(repository, transport, attachmentStorage);
    const result = await useCase.execute({
      to: 'client@test.com',
      subject: 'Erreur',
      body: 'Test',
    });

    expect(result.status).toBe(EMAIL_STATUS.FAILED);
    expect(result.errorMessage).toBe('SMTP down');
  });
});
