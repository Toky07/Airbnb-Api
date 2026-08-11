import { BadRequestException, NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import {
  createPaymentRepositoryMock,
  createSamplePayment,
} from '@src/modules/payment/applications/useCase/payment-test.helpers';
import { PAYMENT_STATUS } from '@src/modules/payment/contracts';
import { CANCELLATION_POLICY } from '@src/modules/reservation/domain/constants/cancellation-policy.constant';
import { ComputeCancellationRefundService } from '@src/modules/reservation/applications/services/compute-cancellation-refund.service';
import {
  createSampleReservation,
  createSampleReservationItem,
} from '@src/modules/reservation/applications/useCase/reservation-test.helpers';
import { GetCancellationPreviewQuery } from '@src/modules/reservation/applications/useCase/queries/GetCancellationPreviewQuery';
import { GetCancellationPreviewQueryHandler } from './GetCancellationPreviewQueryHandler';

describe('GetCancellationPreviewQueryHandler', () => {
  const access = {
    authId: 1,
    canReadAll: true,
    canReadHost: false,
  };

  function createHandler(overrides: {
    reservation?: ReturnType<typeof createSampleReservation> | null;
    payment?: ReturnType<typeof createSamplePayment> | null;
    assertCanManage?: ReturnType<typeof vi.fn>;
  }) {
    const reservation =
      overrides.reservation === undefined
        ? createSampleReservation({
            id: 1,
            items: [
              createSampleReservationItem({
                checkIn: '2099-09-01',
                checkOut: '2099-09-03',
              }),
            ],
          })
        : overrides.reservation;

    const assertReservationAccess = {
      requireReservation: vi.fn().mockResolvedValue(reservation),
      assertCanManage:
        overrides.assertCanManage ?? vi.fn().mockResolvedValue(undefined),
    };

    const payment =
      overrides.payment === undefined
        ? createSamplePayment({
            id: 1,
            status: PAYMENT_STATUS.SUCCEEDED,
          })
        : overrides.payment;

    return new GetCancellationPreviewQueryHandler(
      assertReservationAccess as never,
      createPaymentRepositoryMock({
        findById: vi.fn().mockResolvedValue(payment),
      }),
      {
        resolve: vi.fn().mockResolvedValue(CANCELLATION_POLICY.FLEXIBLE),
      } as never,
      new ComputeCancellationRefundService(),
    );
  }

  it('retourne un aperçu de remboursement', async () => {
    const handler = createHandler({});

    const result = await handler.execute(
      new GetCancellationPreviewQuery(1, access),
    );

    expect(result.reservationId).toBe(1);
    expect(result.paymentAmount).toBe(20_000);
    expect(result.refundPercent).toBeGreaterThan(0);
  });

  it('lève NotFound quand le paiement est absent', async () => {
    const handler = createHandler({ payment: null });

    await expect(
      handler.execute(new GetCancellationPreviewQuery(1, access)),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('lève BadRequest quand le check-in est absent', async () => {
    const reservation = createSampleReservation({
      id: 1,
      items: [
        createSampleReservationItem({
          checkIn: '',
        }),
      ],
    });
    Object.assign(reservation.items[0], { checkIn: undefined });

    const handler = createHandler({
      reservation: reservation,
    });

    await expect(
      handler.execute(new GetCancellationPreviewQuery(1, access)),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('utilise un montant de base 0 si le paiement n’est pas réussi', async () => {
    const handler = createHandler({
      payment: createSamplePayment({
        id: 1,
        status: PAYMENT_STATUS.PENDING,
      }),
    });

    const result = await handler.execute(
      new GetCancellationPreviewQuery(1, access),
    );

    expect(result.refundAmount).toBe(0);
    expect(result.paymentAmount).toBe(20_000);
  });
});
