export const CURRENCY = {
  EUR: 'eur',
} as const;

export type Currency = (typeof CURRENCY)[keyof typeof CURRENCY];
