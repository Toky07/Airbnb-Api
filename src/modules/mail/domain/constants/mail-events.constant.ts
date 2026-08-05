export const MAIL_EVENTS = {
  SEND_REQUESTED: 'email.send.requested',
} as const;

export type MailEventName = (typeof MAIL_EVENTS)[keyof typeof MAIL_EVENTS];
