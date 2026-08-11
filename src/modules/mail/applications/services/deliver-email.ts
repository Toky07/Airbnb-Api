import { EMAIL_STATUS } from '@src/modules/mail/domain/constants/email-status.constant';
import { Email } from '@src/modules/mail/domain/entities/email.entity';
import type { IEmailRepository } from '@src/modules/mail/domain/repositories/email.repository';
import type { IMailTransport } from '@src/modules/mail/domain/ports/mail-transport.port';
import { loadTransportAttachments } from './load-transport-attachments';

export async function deliverEmail(
  repository: IEmailRepository,
  transport: IMailTransport,
  email: Email,
): Promise<Email> {
  try {
    await transport.send({
      to: email.to,
      cc: email.cc,
      bcc: email.bcc,
      subject: email.subject,
      text: email.isHtml ? undefined : email.body,
      html: email.isHtml ? email.body : undefined,
      attachments: await loadTransportAttachments(email.attachments),
    });

    return repository.update(
      new Email(
        email.to,
        email.subject,
        email.body,
        EMAIL_STATUS.SENT,
        email.cc,
        email.bcc,
        email.isHtml,
        email.sourceModule,
        email.sentByAuthId,
        null,
        new Date(),
        email.attachments,
        email.id,
        email.createdAt,
        email.updatedAt,
      ),
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Email send failed';
    return repository.update(
      new Email(
        email.to,
        email.subject,
        email.body,
        EMAIL_STATUS.FAILED,
        email.cc,
        email.bcc,
        email.isHtml,
        email.sourceModule,
        email.sentByAuthId,
        message,
        null,
        email.attachments,
        email.id,
        email.createdAt,
        email.updatedAt,
      ),
    );
  }
}
