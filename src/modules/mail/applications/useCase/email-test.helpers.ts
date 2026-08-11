import { vi } from 'vitest';
import { Email } from '@src/modules/mail/domain/entities/email.entity';
import type { IEmailRepository } from '@src/modules/mail/domain/repositories/email.repository';
import type { IMailTransport } from '@src/modules/mail/domain/ports/mail-transport.port';
import { EmailAttachmentStorageService } from '@src/modules/mail/infrastructure/storage/email-attachment-storage.service';

export function createPersistedEmail(email: Email, id = 1): Email {
  return new Email(
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
    id,
    new Date(),
    new Date(),
  );
}

export function createEmailRepositoryMock(
  overrides: Partial<IEmailRepository> = {},
): IEmailRepository {
  return {
    create: vi
      .fn()
      .mockImplementation(async (email: Email) => createPersistedEmail(email)),
    update: vi.fn().mockImplementation(async (email: Email) => email),
    findById: vi.fn(),
    findPaginated: vi.fn(),
    ...overrides,
  };
}

export function createMailTransportMock(
  send: IMailTransport['send'] = vi.fn().mockResolvedValue(undefined),
): IMailTransport {
  return { send };
}

export function createAttachmentStorageMock(): EmailAttachmentStorageService {
  return {
    saveMany: vi.fn().mockResolvedValue([]),
  };
}
