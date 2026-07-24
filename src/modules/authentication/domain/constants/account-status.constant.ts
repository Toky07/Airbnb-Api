export const ACCOUNT_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
} as const;

export type AccountStatus =
  (typeof ACCOUNT_STATUS)[keyof typeof ACCOUNT_STATUS];

export const PASSWORD_SETUP_TOKEN_TTL_HOURS = 48;
export const PASSWORD_RESET_TOKEN_TTL_HOURS = 24;
