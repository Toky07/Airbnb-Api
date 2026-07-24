export const ACCOUNT_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  DISABLED: 'disabled',
} as const;

export const ADMIN_MANAGEABLE_ACCOUNT_STATUSES = [
  ACCOUNT_STATUS.ACTIVE,
  ACCOUNT_STATUS.DISABLED,
] as const;

export type AdminManageableAccountStatus =
  (typeof ADMIN_MANAGEABLE_ACCOUNT_STATUSES)[number];

export type AccountStatus =
  (typeof ACCOUNT_STATUS)[keyof typeof ACCOUNT_STATUS];

export const PASSWORD_SETUP_TOKEN_TTL_HOURS = 48;
export const PASSWORD_RESET_TOKEN_TTL_HOURS = 24;
