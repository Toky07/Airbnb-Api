import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';
import type {
  IMailTransport,
  MailTransportMessage,
} from '@src/modules/mail/domain/ports/mail-transport.port';
import {
  getSmtpFrom,
  getSmtpHost,
  getSmtpPass,
  getSmtpPort,
  getSmtpUser,
  isSmtpSecure,
} from '@src/config/env.config';

@Injectable()
export class SmtpMailTransport implements IMailTransport {
  private readonly transporter;

  constructor() {
    const host = getSmtpHost();
    const port = getSmtpPort();
    const user = getSmtpUser();
    const pass = getSmtpPass();

    if (!host) {
      throw new Error('SMTP_HOST is required when MAIL_TRANSPORT=smtp');
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: isSmtpSecure(),
      auth: user && pass ? { user, pass } : undefined,
    });
  }

  async send(message: MailTransportMessage): Promise<void> {
    const from = getSmtpFrom();

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
