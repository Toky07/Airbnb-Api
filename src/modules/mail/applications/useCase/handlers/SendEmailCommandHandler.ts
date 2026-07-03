import type { ICommandHandler } from '../../../../../shared/useCase/bus/command-handler.interface';
import { EMAIL_STATUS } from '../../../domain/constants/email-status.constant';
import { Email } from '../../../domain/entities/email.entity';
import type { IEmailRepository } from '../../../domain/repositories/email.repository';
import type { IMailTransport } from '../../../domain/ports/mail-transport.port';
import type { EmailAttachmentStorageService } from '../../../infrastructure/storage/email-attachment-storage.service';
import { EmailOutput } from '../../dto/email.output';
import { parseRecipientList } from '../../dto/send-email.dto';
import { deliverEmail } from '../../services/deliver-email';
import type { SendEmailCommand } from '../commands/SendEmailCommand';

export class SendEmailCommandHandler implements ICommandHandler<
  SendEmailCommand,
  EmailOutput
> {
  constructor(
    private readonly repository: IEmailRepository,
    private readonly transport: IMailTransport,
    private readonly attachmentStorage: EmailAttachmentStorageService,
  ) {}

  async execute(command: SendEmailCommand): Promise<EmailOutput> {
    const options = command.options;
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
