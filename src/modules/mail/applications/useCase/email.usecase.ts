import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { PaginatedResult, PaginationParams } from '../../../../shared/pagination/pagination.types';
import { EMAIL_STATUS } from '../../domain/constants/email-status.constant';
import { Email } from '../../domain/entities/email.entity';
import {
  EMAIL_REPOSITORY,
  type IEmailRepository,
} from '../../domain/repositories/email.repository';
import {
  MAIL_TRANSPORT,
  type IMailTransport,
  type MailTransportAttachment,
} from '../../domain/ports/mail-transport.port';
import type { UploadFile } from '../../../media/types/upload-file';
import { EmailAttachmentStorageService } from '../../infrastructure/storage/email-attachment-storage.service';
import { EmailOutput } from '../dto/email.output';
import type { SendEmailDto } from '../dto/send-email.dto';
import { parseRecipientList } from '../dto/send-email.dto';
import { readFile } from 'fs/promises';
import { join } from 'path';

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
      email = await this.repository.update(
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
          attachments,
          email.id,
          email.createdAt,
          email.updatedAt,
        ),
      );
    }

    try {
      await this.transport.send({
        to: email.to,
        cc: email.cc,
        bcc: email.bcc,
        subject: email.subject,
        text: email.isHtml ? undefined : email.body,
        html: email.isHtml ? email.body : undefined,
        attachments: await this.loadTransportAttachments(email.attachments),
      });

      email = await this.repository.update(
        new Email(
          email.to,
          email.subject,
          email.body,
          EMAIL_STATUS.SENT,
          email.cc,
          email.bcc,
          email.isHtml,
          email.sourceModule,
          email.sentByAuthId,
          null,
          new Date(),
          email.attachments,
          email.id,
          email.createdAt,
          email.updatedAt,
        ),
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Email send failed';
      email = await this.repository.update(
        new Email(
          email.to,
          email.subject,
          email.body,
          EMAIL_STATUS.FAILED,
          email.cc,
          email.bcc,
          email.isHtml,
          email.sourceModule,
          email.sentByAuthId,
          message,
          null,
          email.attachments,
          email.id,
          email.createdAt,
          email.updatedAt,
        ),
      );
    }

    return EmailOutput.fromDomain(email);
  }

  private async loadTransportAttachments(
    attachments: Email['attachments'],
  ): Promise<MailTransportAttachment[]> {
    const result: MailTransportAttachment[] = [];

    for (const attachment of attachments) {
      const absolutePath = join(process.cwd(), attachment.storedPath);
      const content = await readFile(absolutePath);
      result.push({
        filename: attachment.originalName,
        content,
        contentType: attachment.mimeType,
      });
    }

    return result;
  }
}

@Injectable()
export class ListEmailsUseCase {
  constructor(
    @Inject(EMAIL_REPOSITORY) private readonly repository: IEmailRepository,
  ) {}

  async execute(params: PaginationParams): Promise<PaginatedResult<EmailOutput>> {
    const result = await this.repository.findPaginated(params);
    return {
      data: result.data.map((email) => EmailOutput.fromDomain(email)),
      meta: result.meta,
    };
  }
}

@Injectable()
export class GetEmailUseCase {
  constructor(
    @Inject(EMAIL_REPOSITORY) private readonly repository: IEmailRepository,
  ) {}

  async execute(id: number): Promise<EmailOutput> {
    const email = await this.repository.findById(id);
    if (!email?.id) {
      throw new NotFoundException('Email not found');
    }
    return EmailOutput.fromDomain(email);
  }
}

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

    try {
      await this.transport.send({
        to: email.to,
        cc: email.cc,
        bcc: email.bcc,
        subject: email.subject,
        text: email.isHtml ? undefined : email.body,
        html: email.isHtml ? email.body : undefined,
        attachments: await this.loadTransportAttachments(email.attachments),
      });

      email = await this.repository.update(
        new Email(
          email.to,
          email.subject,
          email.body,
          EMAIL_STATUS.SENT,
          email.cc,
          email.bcc,
          email.isHtml,
          email.sourceModule,
          email.sentByAuthId,
          null,
          new Date(),
          email.attachments,
          email.id,
          email.createdAt,
          email.updatedAt,
        ),
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Email send failed';
      email = await this.repository.update(
        new Email(
          email.to,
          email.subject,
          email.body,
          EMAIL_STATUS.FAILED,
          email.cc,
          email.bcc,
          email.isHtml,
          email.sourceModule,
          email.sentByAuthId,
          message,
          null,
          email.attachments,
          email.id,
          email.createdAt,
          email.updatedAt,
        ),
      );
    }

    return EmailOutput.fromDomain(email);
  }

  private async loadTransportAttachments(
    attachments: Email['attachments'],
  ): Promise<MailTransportAttachment[]> {
    const result: MailTransportAttachment[] = [];

    for (const attachment of attachments) {
      const absolutePath = join(process.cwd(), attachment.storedPath);
      const content = await readFile(absolutePath);
      result.push({
        filename: attachment.originalName,
        content,
        contentType: attachment.mimeType,
      });
    }

    return result;
  }
}
