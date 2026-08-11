import type { EmailStatus } from '@src/modules/mail/domain/constants/email-status.constant';
import type { EmailAttachment } from './email-attachment.entity';

export class Email {
  constructor(
    public readonly to: string[],
    public readonly subject: string,
    public readonly body: string,
    public readonly status: EmailStatus,
    public readonly cc: string[] = [],
    public readonly bcc: string[] = [],
    public readonly isHtml = false,
    public readonly sourceModule: string | null = null,
    public readonly sentByAuthId: number | null = null,
    public readonly errorMessage: string | null = null,
    public readonly sentAt: Date | null = null,
    public attachments: EmailAttachment[] = [],
    public readonly id?: number,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}
}
