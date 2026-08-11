import type { UploadFile } from '@src/modules/media/contracts';
import type { SendEmailDto } from '@src/modules/mail/applications/dto/send-email.dto';

export type SendEmailCommandPayload = SendEmailDto & {
  sentByAuthId?: number | null;
  files?: UploadFile[];
};

export class SendEmailCommand {
  constructor(public readonly options: SendEmailCommandPayload) {}
}
