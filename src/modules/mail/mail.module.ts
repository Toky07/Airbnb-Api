import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailOrmEntity } from './infrastructure/entities/email.orm-entity';
import { EmailRepository } from './infrastructure/repositories/email.repository';
import { EMAIL_REPOSITORY } from './domain/repositories/email.repository';
import { MailController } from './interfaces/http/mail.controller';
import { GetEmailUseCase } from './applications/useCase/get-email.usecase';
import { ListEmailsUseCase } from './applications/useCase/list-emails.usecase';
import { RetryEmailUseCase } from './applications/useCase/retry-email.usecase';
import { SendEmailUseCase } from './applications/useCase/send-email.usecase';
import { MailService } from './applications/services/mail.service';
import { LoadEmailAttachmentsFromPathsService } from './applications/services/load-email-attachments-from-paths.service';
import { MailEvent } from './applications/events/register-mail.event';
import { EmailAttachmentStorageService } from './infrastructure/storage/email-attachment-storage.service';
import { MailTransportFactory } from './infrastructure/transport/mail-transport.factory';
import { MAIL_TRANSPORT } from './domain/ports/mail-transport.port';

@Module({
  imports: [TypeOrmModule.forFeature([EmailOrmEntity])],
  controllers: [MailController],
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
    SendEmailUseCase,
    ListEmailsUseCase,
    GetEmailUseCase,
    RetryEmailUseCase,
    MailService,
    EmailAttachmentStorageService,
    LoadEmailAttachmentsFromPathsService,
    MailEvent,
  ],
  exports: [MailService, SendEmailUseCase],
})
export class MailModule {}
