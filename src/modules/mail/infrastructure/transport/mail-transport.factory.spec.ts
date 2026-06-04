import { afterEach, describe, expect, it } from 'vitest';
import { ConsoleMailTransport } from './console-mail.transport';
import { MailTransportFactory } from './mail-transport.factory';
import { ResendMailTransport } from './resend-mail.transport';
import { SmtpMailTransport } from './smtp-mail.transport';

describe('MailTransportFactory', () => {
  const previousEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...previousEnv };
  });

  it('utilise le transport console par défaut', () => {
    delete process.env.MAIL_TRANSPORT;
    const factory = new MailTransportFactory();
    expect(factory.create()).toBeInstanceOf(ConsoleMailTransport);
  });

  it('utilise Resend quand MAIL_TRANSPORT=resend', () => {
    process.env.MAIL_TRANSPORT = 'resend';
    process.env.RESEND_API_KEY = 're_test_key';
    const factory = new MailTransportFactory();
    expect(factory.create()).toBeInstanceOf(ResendMailTransport);
  });

  it('utilise SMTP quand MAIL_TRANSPORT=smtp', () => {
    process.env.MAIL_TRANSPORT = 'smtp';
    process.env.SMTP_HOST = 'smtp.example.com';
    const factory = new MailTransportFactory();
    expect(factory.create()).toBeInstanceOf(SmtpMailTransport);
  });
});
