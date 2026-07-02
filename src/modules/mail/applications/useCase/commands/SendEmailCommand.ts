import type { UploadFile } from '../../../../media/types/upload-file';
import type { SendEmailDto } from '../../dto/send-email.dto';

export type SendEmailCommandPayload = SendEmailDto & {
  sentByAuthId?: number | null;
  files?: UploadFile[];
};

export class SendEmailCommand {
  constructor(public readonly options: SendEmailCommandPayload) {}
}
