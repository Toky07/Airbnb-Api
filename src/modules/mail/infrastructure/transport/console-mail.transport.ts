import { Injectable, Logger } from '@nestjs/common';
import type {
  IMailTransport,
  MailTransportMessage,
} from '../../domain/ports/mail-transport.port';

@Injectable()
export class ConsoleMailTransport implements IMailTransport {
  private readonly logger = new Logger(ConsoleMailTransport.name);

  async send(message: MailTransportMessage): Promise<void> {
    this.logger.log(
      `[DEV MAIL] to=${message.to.join(', ')} subject="${message.subject}" attachments=${message.attachments?.length ?? 0}`,
    );
  }
}
