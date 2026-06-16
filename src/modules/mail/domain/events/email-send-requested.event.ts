import { DomainEvent } from '../../../../shared/domain/domain.event';

export type EmailSendAttachmentPayload = {
  path: string;
  filename: string;
  mimeType?: string;
};

export class EmailSendRequestedEvent implements DomainEvent {
  eventName = 'email.send.requested';
  occurredOn = new Date();

  constructor(
    public readonly to: string | string[],
    public readonly subject: string,
    public readonly body: string,
    public readonly isHtml = false,
    public readonly sourceModule: string | null = null,
    public readonly attachments: EmailSendAttachmentPayload[] = [],
  ) {}
}
