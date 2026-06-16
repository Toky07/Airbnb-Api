import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EventBus } from '../../../../shared/domain/event.bus';
import { EmailSendRequestedEvent } from '../../domain/events/email-send-requested.event';
import { MailEvent } from '../events/register-mail.event';

describe('MailEvent', () => {
  const sendEmail = {
    execute: vi.fn(),
  };
  const loadAttachments = {
    execute: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    EventBus.getInstance()['handlers'] = new Map();
    sendEmail.execute.mockResolvedValue({});
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
    const mailEvent = new MailEvent(
      sendEmail as never,
      loadAttachments as never,
    );
    await mailEvent.onModuleInit();

    await EventBus.getInstance().publish(
      new EmailSendRequestedEvent(
        'client@test.com',
        'Confirmation de paiement',
        '<p>Hello</p>',
        true,
        'invoice-customer',
        [{ path: 'uploads/invoices/facture.pdf', filename: 'facture.pdf', mimeType: 'application/pdf' }],
      ),
    );

    expect(loadAttachments.execute).toHaveBeenCalled();
    expect(sendEmail.execute).toHaveBeenCalledWith(
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
