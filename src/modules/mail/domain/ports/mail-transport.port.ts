export const MAIL_TRANSPORT = 'MAIL_TRANSPORT';

export type MailTransportAttachment = {
  filename: string;
  content: Buffer;
  contentType?: string;
};

export type MailTransportMessage = {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: MailTransportAttachment[];
};

export interface IMailTransport {
  send(message: MailTransportMessage): Promise<void>;
}
