import { Injectable } from '@nestjs/common';
import {
  CANCELLATION_POLICY,
  CANCELLATION_POLICY_LABELS,
  type CancellationPolicy,
} from '@src/modules/reservation/domain/constants/cancellation-policy.constant';

export type CancellationRefundResult = {
  refundAmount: number;
  refundPercent: number;
  policyLabel: string;
};

@Injectable()
export class ComputeCancellationRefundService {
  compute(params: {
    paymentAmount: number;
    checkIn: string;
    policy: CancellationPolicy;
    cancelledAt?: Date;
  }): CancellationRefundResult {
    const cancelledAt = params.cancelledAt ?? new Date();
    const refundPercent = this.resolveRefundPercent(
      params.policy,
      params.checkIn,
      cancelledAt,
    );
    const refundAmount = Math.round(
      (params.paymentAmount * refundPercent) / 100,
    );

    return {
      refundAmount,
      refundPercent,
      policyLabel: CANCELLATION_POLICY_LABELS[params.policy],
    };
  }

  private resolveRefundPercent(
    policy: CancellationPolicy,
    checkIn: string,
    cancelledAt: Date,
  ): number {
    const daysBefore = this.daysBeforeCheckIn(checkIn, cancelledAt);

    switch (policy) {
      case CANCELLATION_POLICY.FLEXIBLE:
        return daysBefore >= 1 ? 100 : 0;
      case CANCELLATION_POLICY.MODERATE:
        if (daysBefore >= 5) {
          return 100;
        }
        if (daysBefore >= 1) {
          return 50;
        }
        return 0;
      case CANCELLATION_POLICY.STRICT:
        if (daysBefore >= 14) {
          return 100;
        }
        if (daysBefore >= 7) {
          return 50;
        }
        return 0;
      default:
        return 0;
    }
  }

  daysBeforeCheckIn(checkIn: string, cancelledAt: Date): number {
    const checkInUtc = Date.parse(`${checkIn}T00:00:00.000Z`);
    const cancelUtc = Date.UTC(
      cancelledAt.getUTCFullYear(),
      cancelledAt.getUTCMonth(),
      cancelledAt.getUTCDate(),
    );

    return Math.floor((checkInUtc - cancelUtc) / (24 * 60 * 60 * 1000));
  }
}
