export const HOST_APPLICATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export type HostApplicationStatus =
  (typeof HOST_APPLICATION_STATUS)[keyof typeof HOST_APPLICATION_STATUS];

export const HOST_APPLICATION_REVIEW_STATUSES = [
  HOST_APPLICATION_STATUS.APPROVED,
  HOST_APPLICATION_STATUS.REJECTED,
] as const;

export type HostApplicationReviewStatus =
  (typeof HOST_APPLICATION_REVIEW_STATUSES)[number];

export const HOST_APPLICATION_MESSAGE_MIN_LENGTH = 30;
export const HOST_APPLICATION_MESSAGE_MAX_LENGTH = 2000;
export const HOST_APPLICATION_CITY_MAX_LENGTH = 120;
export const HOST_APPLICATION_PROPERTY_NAME_MAX_LENGTH = 180;
export const HOST_APPLICATION_REVIEW_COMMENT_MAX_LENGTH = 1000;
export const HOST_APPLICATION_REJECT_COMMENT_MIN_LENGTH = 10;

export const HOST_APPLICATION_MAIL_SOURCE = 'host-application';

export function isHostApplicationStatus(
  value: unknown,
): value is HostApplicationStatus {
  return (
    value === HOST_APPLICATION_STATUS.PENDING ||
    value === HOST_APPLICATION_STATUS.APPROVED ||
    value === HOST_APPLICATION_STATUS.REJECTED
  );
}

export function isHostApplicationReviewStatus(
  value: unknown,
): value is HostApplicationReviewStatus {
  return (
    value === HOST_APPLICATION_STATUS.APPROVED ||
    value === HOST_APPLICATION_STATUS.REJECTED
  );
}
