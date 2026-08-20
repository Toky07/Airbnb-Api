import type { SubmitContactMessageDto } from '@src/modules/mail/applications/dto/submit-contact-message.dto';

export class SubmitContactMessageCommand {
  constructor(public readonly dto: SubmitContactMessageDto) {}
}
