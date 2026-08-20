import { Inject, Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailOrmEntity } from './infrastructure/entities/email.orm-entity';
import { EmailRepository } from './infrastructure/repositories/email.repository';
import { EMAIL_REPOSITORY } from './domain/repositories/email.repository';
import type { IEmailRepository } from './domain/repositories/email.repository';
import { MailController } from './interfaces/http/mail.controller';
import { ContactController } from './interfaces/http/contact.controller';
import { MailService } from './applications/services/mail.service';
import { LoadEmailAttachmentsFromPathsService } from './applications/services/load-email-attachments-from-paths.service';
import { MailEvent } from './applications/events/register-mail.event';
import { EmailAttachmentStorageService } from './infrastructure/storage/email-attachment-storage.service';
import { MailTransportFactory } from './infrastructure/transport/mail-transport.factory';
import { MAIL_TRANSPORT } from './domain/ports/mail-transport.port';
import type { IMailTransport } from './domain/ports/mail-transport.port';
import { MailBootstrap } from './mail.bootstrap';
import { CommandBus } from '@src/shared/useCase/bus/bus';
import { QueryBus } from '@src/shared/useCase/bus/query-bus';
import { SendEmailCommand } from './applications/useCase/commands/SendEmailCommand';
import { RetryEmailCommand } from './applications/useCase/commands/RetryEmailCommand';
import { GetEmailQuery } from './applications/useCase/queries/GetEmailQuery';
import { ListEmailsQuery } from './applications/useCase/queries/ListEmailsQuery';
import { SubmitContactMessageCommand } from './applications/useCase/commands/SubmitContactMessageCommand';

@Module({
  imports: [TypeOrmModule.forFeature([EmailOrmEntity])],
  controllers: [MailController, ContactController],
  providers: [
    EmailRepository,
    {
      provide: EMAIL_REPOSITORY,
      useClass: EmailRepository,
    },
    MailTransportFactory,
    {
      provide: MAIL_TRANSPORT,
      useFactory: (factory: MailTransportFactory) => factory.create(),
      inject: [MailTransportFactory],
    },
    MailService,
    EmailAttachmentStorageService,
    LoadEmailAttachmentsFromPathsService,
    MailEvent,
  ],
  exports: [MailService],
})
export class MailModule implements OnModuleInit {
  constructor(
    @Inject(EMAIL_REPOSITORY)
    private readonly emailRepository: IEmailRepository,
    @Inject(MAIL_TRANSPORT)
    private readonly mailTransport: IMailTransport,
    private readonly attachmentStorage: EmailAttachmentStorageService,
  ) {}

  onModuleInit() {
    const bootstrap = MailBootstrap.create({
      emailRepository: this.emailRepository,
      mailTransport: this.mailTransport,
      attachmentStorage: this.attachmentStorage,
    });

    CommandBus.register(SendEmailCommand, bootstrap.sendEmailCommandHandler);
    CommandBus.register(RetryEmailCommand, bootstrap.retryEmailCommandHandler);

    QueryBus.register(GetEmailQuery, bootstrap.getEmailQueryHandler);
    QueryBus.register(ListEmailsQuery, bootstrap.listEmailsQueryHandler);
    CommandBus.register(
      SubmitContactMessageCommand,
      bootstrap.submitContactMessageCommandHandler,
    );
  }
}
