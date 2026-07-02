import type { IEmailRepository } from './domain/repositories/email.repository';
import type { IMailTransport } from './domain/ports/mail-transport.port';
import type { EmailAttachmentStorageService } from './infrastructure/storage/email-attachment-storage.service';
import { SendEmailCommandHandler } from './applications/useCase/handlers/SendEmailCommandHandler';
import { RetryEmailCommandHandler } from './applications/useCase/handlers/RetryEmailCommandHandler';
import { GetEmailQueryHandler } from './applications/useCase/handlers/GetEmailQueryHandler';
import { ListEmailsQueryHandler } from './applications/useCase/handlers/ListEmailsQueryHandler';

export class MailBootstrap {
  static create(deps: {
    emailRepository: IEmailRepository;
    mailTransport: IMailTransport;
    attachmentStorage: EmailAttachmentStorageService;
  }) {
    return {
      sendEmailCommandHandler: new SendEmailCommandHandler(
        deps.emailRepository,
        deps.mailTransport,
        deps.attachmentStorage,
      ),
      retryEmailCommandHandler: new RetryEmailCommandHandler(
        deps.emailRepository,
        deps.mailTransport,
      ),
      getEmailQueryHandler: new GetEmailQueryHandler(deps.emailRepository),
      listEmailsQueryHandler: new ListEmailsQueryHandler(deps.emailRepository),
    };
  }
}
