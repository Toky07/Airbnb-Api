import { Injectable } from '@nestjs/common';
import type { UploadFile } from '@src/modules/media/contracts';
import { CommandBus } from '@src/shared/useCase/bus/bus';
import {
  SendEmailCommand,
  type SendEmailCommandPayload,
} from '@src/modules/mail/applications/useCase/commands/SendEmailCommand';
import { EmailOutput } from '@src/modules/mail/applications/dto/email.output';

/**
 * Facade exported for other modules (users, host, import, etc.).
 */
@Injectable()
export class MailService {
  async send(options: SendEmailCommandPayload): Promise<EmailOutput> {
    return CommandBus.execute(new SendEmailCommand(options));
  }

  async sendSimple(options: {
    to: string | string[];
    subject: string;
    body: string;
    isHtml?: boolean;
    sourceModule?: string;
    sentByAuthId?: number | null;
    files?: UploadFile[];
  }): Promise<EmailOutput> {
    const to = Array.isArray(options.to) ? options.to.join(', ') : options.to;
    return CommandBus.execute(
      new SendEmailCommand({
        to,
        subject: options.subject,
        body: options.body,
        isHtml: options.isHtml,
        sourceModule: options.sourceModule,
        sentByAuthId: options.sentByAuthId,
        files: options.files,
      }),
    );
  }
}
