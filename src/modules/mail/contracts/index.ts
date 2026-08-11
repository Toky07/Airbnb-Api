/**
 * Surface publique du module mail.
 * Les autres modules doivent importer uniquement depuis ce barrel
 * (sauf ORM TypeORM et MailModule Nest).
 */
export { MailService } from '../applications/services/mail.service';
export {
  EmailSendRequestedEvent,
  type EmailSendAttachmentPayload,
} from '../domain/events/email-send-requested.event';
