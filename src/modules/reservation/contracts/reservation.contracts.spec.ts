import { describe, expect, it } from 'vitest';
import {
  BLOCKING_RESERVATION_STATUSES,
  CANCELLATION_POLICY,
  CancelReservationCommand,
  DEFAULT_CANCELLATION_POLICY,
  RESERVATION_REPOSITORY,
  RESERVATION_STATUS,
} from './index';
import {
  CANCELLATION_POLICY as LeafCancellationPolicy,
  DEFAULT_CANCELLATION_POLICY as LeafDefault,
} from './cancellation-policy';

describe('reservation/contracts', () => {
  it('expose tokens, constantes et commands publics', () => {
    expect(RESERVATION_REPOSITORY).toBe('RESERVATION_REPOSITORY');
    expect(RESERVATION_STATUS.CONFIRMED).toBe('confirmed');
    expect(BLOCKING_RESERVATION_STATUSES).toContain(RESERVATION_STATUS.PENDING);
    expect(DEFAULT_CANCELLATION_POLICY).toBe(CANCELLATION_POLICY.MODERATE);
    expect(
      new CancelReservationCommand(1, {
        authId: 1,
        canCancelAll: true,
        canCancelHost: false,
      }),
    ).toBeInstanceOf(CancelReservationCommand);
  });

  it('expose cancellation-policy via contrat feuille (anti-cycle)', () => {
    expect(LeafDefault).toBe(LeafCancellationPolicy.MODERATE);
    expect(LeafCancellationPolicy).toBe(CANCELLATION_POLICY);
  });
});
