export const CANCELLATION_POLICY = {
  FLEXIBLE: 'flexible',
  MODERATE: 'moderate',
  STRICT: 'strict',
} as const;

export type CancellationPolicy =
  (typeof CANCELLATION_POLICY)[keyof typeof CANCELLATION_POLICY];

export const DEFAULT_CANCELLATION_POLICY = CANCELLATION_POLICY.MODERATE;

export const CANCELLATION_POLICY_LABELS: Record<CancellationPolicy, string> = {
  [CANCELLATION_POLICY.FLEXIBLE]: 'Annulation flexible',
  [CANCELLATION_POLICY.MODERATE]: 'Annulation modérée',
  [CANCELLATION_POLICY.STRICT]: 'Annulation stricte',
};

export function isCancellationPolicy(
  value: unknown,
): value is CancellationPolicy {
  return (
    value === CANCELLATION_POLICY.FLEXIBLE ||
    value === CANCELLATION_POLICY.MODERATE ||
    value === CANCELLATION_POLICY.STRICT
  );
}

export function parseCancellationPolicy(
  value: unknown,
): CancellationPolicy | null {
  if (isCancellationPolicy(value)) {
    return value;
  }
  return null;
}
