import { describe, expect, it } from 'vitest';
import { EmailSendRequestedEvent, MailService } from './index';

describe('mail/contracts', () => {
  it('expose la façade MailService et l’événement d’envoi', () => {
    expect(MailService).toBeTypeOf('function');
    expect(
      new EmailSendRequestedEvent('a@b.c', 'Sujet', 'Corps', false, 'test'),
    ).toBeInstanceOf(EmailSendRequestedEvent);
  });
});
