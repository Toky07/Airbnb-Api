export const EMAIL_STATUS = {
  PENDING: 'pending',
  SENT: 'sent',
  FAILED: 'failed',
} as const;

export type EmailStatus = (typeof EMAIL_STATUS)[keyof typeof EMAIL_STATUS];

export const EMAIL_STATUS_LABELS: Record<EmailStatus, string> = {
  pending: 'En attente',
  sent: 'Envoyé',
  failed: 'Échec',
};
