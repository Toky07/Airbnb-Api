import { Injectable } from '@nestjs/common';
import { ConsoleMailTransport } from './console-mail.transport';
import { ResendMailTransport } from './resend-mail.transport';
import { SmtpMailTransport } from './smtp-mail.transport';
import type { IMailTransport } from '../../domain/ports/mail-transport.port';

@Injectable()
export class MailTransportFactory {
  create(): IMailTransport {
    const mode = (process.env.MAIL_TRANSPORT ?? 'console').toLowerCase();
    if (mode === 'resend') {
      return new ResendMailTransport();
    }
    if (mode === 'smtp') {
      return new SmtpMailTransport();
    }
    return new ConsoleMailTransport();
  }
}

export function createMailTransportProvider() {
  return {
    provide: 'MAIL_TRANSPORT',
    useFactory: (factory: MailTransportFactory) => factory.create(),
    inject: [MailTransportFactory],
  };
}
