import { describe, expect, it } from 'vitest';
import { CANCELLATION_POLICY } from '../../domain/constants/cancellation-policy.constant';
import { ComputeCancellationRefundService } from './compute-cancellation-refund.service';

describe('ComputeCancellationRefundService', () => {
  const service = new ComputeCancellationRefundService();

  it('flexible rembourse intégralement avant le jour d’arrivée', () => {
    const result = service.compute({
      paymentAmount: 20_000,
      checkIn: '2026-09-10',
      policy: CANCELLATION_POLICY.FLEXIBLE,
      cancelledAt: new Date('2026-09-09T15:00:00.000Z'),
    });

    expect(result.refundPercent).toBe(100);
    expect(result.refundAmount).toBe(20_000);
  });

  it('flexible ne rembourse pas le jour J', () => {
    const result = service.compute({
      paymentAmount: 20_000,
      checkIn: '2026-09-10',
      policy: CANCELLATION_POLICY.FLEXIBLE,
      cancelledAt: new Date('2026-09-10T08:00:00.000Z'),
    });

    expect(result.refundPercent).toBe(0);
    expect(result.refundAmount).toBe(0);
  });

  it('modérée rembourse 50 % entre 1 et 4 jours avant', () => {
    const result = service.compute({
      paymentAmount: 10_000,
      checkIn: '2026-09-10',
      policy: CANCELLATION_POLICY.MODERATE,
      cancelledAt: new Date('2026-09-08T10:00:00.000Z'),
    });

    expect(result.refundPercent).toBe(50);
    expect(result.refundAmount).toBe(5_000);
  });

  it('modérée rembourse intégralement 5 jours ou plus avant', () => {
    const result = service.compute({
      paymentAmount: 10_000,
      checkIn: '2026-09-10',
      policy: CANCELLATION_POLICY.MODERATE,
      cancelledAt: new Date('2026-09-05T10:00:00.000Z'),
    });

    expect(result.refundPercent).toBe(100);
    expect(result.refundAmount).toBe(10_000);
  });

  it('stricte ne rembourse pas moins de 7 jours avant', () => {
    const result = service.compute({
      paymentAmount: 10_000,
      checkIn: '2026-09-10',
      policy: CANCELLATION_POLICY.STRICT,
      cancelledAt: new Date('2026-09-05T10:00:00.000Z'),
    });

    expect(result.refundPercent).toBe(0);
    expect(result.refundAmount).toBe(0);
  });

  it('stricte rembourse 50 % entre 7 et 13 jours avant', () => {
    const result = service.compute({
      paymentAmount: 10_000,
      checkIn: '2026-09-20',
      policy: CANCELLATION_POLICY.STRICT,
      cancelledAt: new Date('2026-09-10T10:00:00.000Z'),
    });

    expect(result.refundPercent).toBe(50);
    expect(result.refundAmount).toBe(5_000);
  });
});
