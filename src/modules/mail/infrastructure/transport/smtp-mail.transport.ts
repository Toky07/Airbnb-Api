import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';
import type {
  IMailTransport,
  MailTransportMessage,
} from '../../domain/ports/mail-transport.port';

@Injectable()
export class SmtpMailTransport implements IMailTransport {
  private readonly transporter;

  constructor() {
    const host = process.env.SMTP_HOST;
    const port = Number.parseInt(process.env.SMTP_PORT ?? '587', 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host) {
      throw new Error('SMTP_HOST is required when MAIL_TRANSPORT=smtp');
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: process.env.SMTP_SECURE === 'true',
      auth: user && pass ? { user, pass } : undefined,
    });
  }

  async send(message: MailTransportMessage): Promise<void> {
    const from = process.env.SMTP_FROM ?? process.env.SMTP_USER ?? 'noreply@airbnb.local';

    await this.transporter.sendMail({
      from,
      to: message.to,
      cc: message.cc,
      bcc: message.bcc,
      subject: message.subject,
      text: message.text,
      html: message.html,
      attachments: message.attachments?.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content,
        contentType: attachment.contentType,
      })),
    });
  }
}
