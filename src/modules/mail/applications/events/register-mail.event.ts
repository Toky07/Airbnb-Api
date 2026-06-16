import { Injectable, OnModuleInit } from '@nestjs/common';
import { EventBus } from '../../../../shared/domain/event.bus';
import type { EmailSendRequestedEvent } from '../../domain/events/email-send-requested.event';
import { LoadEmailAttachmentsFromPathsService } from '../services/load-email-attachments-from-paths.service';
import { SendEmailUseCase } from '../useCase/send-email.usecase';

@Injectable()
export class MailEvent implements OnModuleInit {
  constructor(
    private readonly sendEmail: SendEmailUseCase,
    private readonly loadAttachments: LoadEmailAttachmentsFromPathsService,
  ) {}

  async onModuleInit(): Promise<void> {
    EventBus.getInstance().subscribe(
      'email.send.requested',
      async (event: EmailSendRequestedEvent) => {
        const to = Array.isArray(event.to) ? event.to.join(', ') : event.to;
        const files = await this.loadAttachments.execute(event.attachments);

        await this.sendEmail.execute({
          to,
          subject: event.subject,
          body: event.body,
          isHtml: event.isHtml,
          sourceModule: event.sourceModule ?? undefined,
          files,
        });
      },
    );
  }
}
