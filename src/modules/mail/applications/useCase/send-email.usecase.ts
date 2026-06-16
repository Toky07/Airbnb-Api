import { Inject, Injectable } from '@nestjs/common';
import { EMAIL_STATUS } from '../../domain/constants/email-status.constant';
import { Email } from '../../domain/entities/email.entity';
import {
  EMAIL_REPOSITORY,
  type IEmailRepository,
} from '../../domain/repositories/email.repository';
import {
  MAIL_TRANSPORT,
  type IMailTransport,
} from '../../domain/ports/mail-transport.port';
import type { UploadFile } from '../../../media/types/upload-file';
import { EmailAttachmentStorageService } from '../../infrastructure/storage/email-attachment-storage.service';
import { EmailOutput } from '../dto/email.output';
import type { SendEmailDto } from '../dto/send-email.dto';
import { parseRecipientList } from '../dto/send-email.dto';
import { deliverEmail } from '../services/deliver-email';

export type SendEmailOptions = SendEmailDto & {
  sentByAuthId?: number | null;
  files?: UploadFile[];
};

@Injectable()
export class SendEmailUseCase {
  constructor(
    @Inject(EMAIL_REPOSITORY) private readonly repository: IEmailRepository,
    @Inject(MAIL_TRANSPORT) private readonly transport: IMailTransport,
    private readonly attachmentStorage: EmailAttachmentStorageService,
  ) {}

  async execute(options: SendEmailOptions): Promise<EmailOutput> {
    const to = parseRecipientList(options.to);
    if (!to.length) {
      throw new Error('At least one recipient is required');
    }

    let email = await this.repository.create(
      new Email(
        to,
        options.subject,
        options.body,
        EMAIL_STATUS.PENDING,
        parseRecipientList(options.cc),
        parseRecipientList(options.bcc),
        Boolean(options.isHtml),
        options.sourceModule?.trim() || null,
        options.sentByAuthId ?? null,
      ),
    );

    const attachments = await this.attachmentStorage.saveMany(
      email.id!,
      options.files,
    );

    if (attachments.length) {
      email.attachments = attachments;
      email = await this.repository.update(email);
    }

    email = await deliverEmail(this.repository, this.transport, email);

    return EmailOutput.fromDomain(email);
  }
}
