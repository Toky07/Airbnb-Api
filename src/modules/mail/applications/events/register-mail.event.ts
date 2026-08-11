import { Injectable, OnModuleInit } from '@nestjs/common';
import { EventBus } from '@src/shared/domain/event.bus';
import { CommandBus } from '@src/shared/useCase/bus/bus';
import type { EmailSendRequestedEvent } from '@src/modules/mail/domain/events/email-send-requested.event';
import { LoadEmailAttachmentsFromPathsService } from '@src/modules/mail/applications/services/load-email-attachments-from-paths.service';
import { SendEmailCommand } from '@src/modules/mail/applications/useCase/commands/SendEmailCommand';

@Injectable()
export class MailEvent implements OnModuleInit {
  constructor(
    private readonly loadAttachments: LoadEmailAttachmentsFromPathsService,
  ) {}

  async onModuleInit(): Promise<void> {
    EventBus.getInstance().subscribe(
      'email.send.requested',
      async (event: EmailSendRequestedEvent) => {
        const to = Array.isArray(event.to) ? event.to.join(', ') : event.to;
        const files = await this.loadAttachments.execute(event.attachments);

        await CommandBus.execute(
          new SendEmailCommand({
            to,
            subject: event.subject,
            body: event.body,
            isHtml: event.isHtml,
            sourceModule: event.sourceModule ?? undefined,
            files,
          }),
        );
      },
    );
  }
}
