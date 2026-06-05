import { Inject, Injectable, NotFoundException } from '@nestjs/common';
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
import { EmailOutput } from '../dto/email.output';
import { deliverEmail } from '../services/deliver-email';

@Injectable()
export class RetryEmailUseCase {
  constructor(
    @Inject(EMAIL_REPOSITORY) private readonly repository: IEmailRepository,
    @Inject(MAIL_TRANSPORT) private readonly transport: IMailTransport,
  ) {}

  async execute(id: number): Promise<EmailOutput> {
    const existing = await this.repository.findById(id);
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
