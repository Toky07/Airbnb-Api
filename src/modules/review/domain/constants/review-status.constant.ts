export const REVIEW_STATUS = {
  PENDING: 'pending',
  PUBLISHED: 'published',
  HIDDEN: 'hidden',
} as const;

export type ReviewStatus = (typeof REVIEW_STATUS)[keyof typeof REVIEW_STATUS];

export const REVIEW_RATING_MIN = 1;
export const REVIEW_RATING_MAX = 5;
