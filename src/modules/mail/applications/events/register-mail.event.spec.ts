import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EventBus } from '@src/shared/domain/event.bus';
import { EmailSendRequestedEvent } from '@src/modules/mail/domain/events/email-send-requested.event';
import { MailEvent } from '@src/modules/mail/applications/events/register-mail.event';
import { SendEmailCommand } from '@src/modules/mail/applications/useCase/commands/SendEmailCommand';
import { commandBusExecuteMock } from '@src/test/command-bus.mock';

describe('MailEvent', () => {
  const loadAttachments = {
    execute: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    EventBus.getInstance()['handlers'] = new Map();
    commandBusExecuteMock.mockResolvedValue({});
    loadAttachments.execute.mockResolvedValue([
      {
        fieldname: 'attachments',
        originalname: 'facture.pdf',
        encoding: '7bit',
        mimetype: 'application/pdf',
        size: 10,
        buffer: Buffer.from('%PDF'),
      },
    ]);
  });

  it('envoie un email à partir de email.send.requested', async () => {
    const mailEvent = new MailEvent(loadAttachments);
    await mailEvent.onModuleInit();

    await EventBus.getInstance().publish(
      new EmailSendRequestedEvent(
        'client@test.com',
        'Confirmation de paiement',
        '<p>Hello</p>',
        true,
        'invoice-customer',
        [
          {
            path: 'uploads/invoices/facture.pdf',
            filename: 'facture.pdf',
            mimeType: 'application/pdf',
          },
        ],
      ),
    );

    expect(loadAttachments.execute).toHaveBeenCalled();
    expect(commandBusExecuteMock).toHaveBeenCalledTimes(1);
    const command = commandBusExecuteMock.mock
      .calls[0]?.[0] as SendEmailCommand;
    expect(command).toBeInstanceOf(SendEmailCommand);
    expect(command.options).toEqual(
      expect.objectContaining({
        to: 'client@test.com',
        subject: 'Confirmation de paiement',
        body: '<p>Hello</p>',
        isHtml: true,
        sourceModule: 'invoice-customer',
      }),
    );
  });
});
