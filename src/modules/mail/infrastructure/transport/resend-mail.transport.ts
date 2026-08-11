import { Injectable, Logger } from '@nestjs/common';
import { Resend, type CreateEmailOptions } from 'resend';
import type {
  IMailTransport,
  MailTransportMessage,
} from '@src/modules/mail/domain/ports/mail-transport.port';
import { getResendApiKey, getResendFrom } from '@src/config/env.config';

@Injectable()
export class ResendMailTransport implements IMailTransport {
  private readonly resend: Resend;
  private readonly from: string;
  private readonly logger = new Logger(ResendMailTransport.name);

  constructor() {
    const apiKey = getResendApiKey();
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is required when MAIL_TRANSPORT=resend');
    }

    this.from = getResendFrom();
    this.resend = new Resend(apiKey);
  }

  async send(message: MailTransportMessage): Promise<void> {
    const attachments = message.attachments?.map((attachment) => ({
      filename: attachment.filename,
      content: attachment.content,
      contentType: attachment.contentType,
    }));

    const baseOptions = {
      from: this.from,
      to: message.to,
      subject: message.subject,
      ...(message.cc?.length ? { cc: message.cc } : {}),
      ...(message.bcc?.length ? { bcc: message.bcc } : {}),
      ...(attachments?.length ? { attachments } : {}),
    };

    const payload: CreateEmailOptions = message.html
      ? {
          ...baseOptions,
          html: message.html,
          ...(message.text ? { text: message.text } : {}),
        }
      : {
          ...baseOptions,
          text: message.text ?? '',
        };

    const { data, error } = await this.resend.emails.send(payload);

    if (error) {
      this.logger.error(`Resend error: ${error.message}`);
      throw new Error(error.message);
    }

    this.logger.log(`Email sent via Resend (id=${data?.id ?? 'unknown'})`);
  }
}
