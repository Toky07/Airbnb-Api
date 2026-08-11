import type { EmailAttachment } from '@src/modules/mail/domain/entities/email-attachment.entity';
import type { EmailStatus } from '@src/modules/mail/domain/constants/email-status.constant';

export class EmailOutput {
  constructor(
    public readonly id: number,
    public readonly to: string[],
    public readonly cc: string[],
    public readonly bcc: string[],
    public readonly subject: string,
    public readonly body: string,
    public readonly isHtml: boolean,
    public readonly status: EmailStatus,
    public readonly errorMessage: string | null,
    public readonly sentAt: Date | null,
    public readonly sourceModule: string | null,
    public readonly sentByAuthId: number | null,
    public readonly attachments: EmailAttachment[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static fromDomain(email: {
    id?: number;
    to: string[];
    cc: string[];
    bcc: string[];
    subject: string;
    body: string;
    isHtml: boolean;
    status: EmailStatus;
    errorMessage: string | null;
    sentAt: Date | null;
    sourceModule: string | null;
    sentByAuthId: number | null;
    attachments: EmailAttachment[];
    createdAt?: Date;
    updatedAt?: Date;
  }): EmailOutput {
    return new EmailOutput(
      email.id!,
      email.to,
      email.cc,
      email.bcc,
      email.subject,
      email.body,
      email.isHtml,
      email.status,
      email.errorMessage,
      email.sentAt,
      email.sourceModule,
      email.sentByAuthId,
      email.attachments,
      email.createdAt!,
      email.updatedAt!,
    );
  }
}
