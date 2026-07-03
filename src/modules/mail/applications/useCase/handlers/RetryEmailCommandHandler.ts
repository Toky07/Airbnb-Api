import { NotFoundException } from '@nestjs/common';
import type { ICommandHandler } from '../../../../../shared/useCase/bus/command-handler.interface';
import { EMAIL_STATUS } from '../../../domain/constants/email-status.constant';
import { Email } from '../../../domain/entities/email.entity';
import type { IEmailRepository } from '../../../domain/repositories/email.repository';
import type { IMailTransport } from '../../../domain/ports/mail-transport.port';
import { EmailOutput } from '../../dto/email.output';
import { deliverEmail } from '../../services/deliver-email';
import type { RetryEmailCommand } from '../commands/RetryEmailCommand';

export class RetryEmailCommandHandler implements ICommandHandler<
  RetryEmailCommand,
  EmailOutput
> {
  constructor(
    private readonly repository: IEmailRepository,
    private readonly transport: IMailTransport,
  ) {}

  async execute(command: RetryEmailCommand): Promise<EmailOutput> {
    const existing = await this.repository.findById(command.id);
    if (!existing?.id) {
      throw new NotFoundException('Email not found');
    }

    let email = await this.repository.update(
      new Email(
        existing.to,
        existing.subject,
        existing.body,
        EMAIL_STATUS.PENDING,
        existing.cc,
        existing.bcc,
        existing.isHtml,
        existing.sourceModule,
        existing.sentByAuthId,
        null,
        null,
        existing.attachments,
        existing.id,
        existing.createdAt,
        existing.updatedAt,
      ),
    );

    email = await deliverEmail(this.repository, this.transport, email);

    return EmailOutput.fromDomain(email);
  }
}
