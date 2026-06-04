import { Injectable } from '@nestjs/common';
import type { UploadFile } from '../../../media/types/upload-file';
import { SendEmailUseCase, type SendEmailOptions } from '../useCase/email.usecase';
import { EmailOutput } from '../dto/email.output';

/**
 * Facade exported for other modules (users, host, import, etc.).
 */
@Injectable()
export class MailService {
  constructor(private readonly sendEmailUseCase: SendEmailUseCase) {}

  async send(options: SendEmailOptions): Promise<EmailOutput> {
    return this.sendEmailUseCase.execute(options);
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
    return this.sendEmailUseCase.execute({
      to,
      subject: options.subject,
      body: options.body,
      isHtml: options.isHtml,
      sourceModule: options.sourceModule,
      sentByAuthId: options.sentByAuthId,
      files: options.files,
    });
  }
}
