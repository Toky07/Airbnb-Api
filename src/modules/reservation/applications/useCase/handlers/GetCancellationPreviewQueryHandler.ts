import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { IQueryHandler } from '../../../../../shared/useCase/bus/query-handler.interface';
import {
  PAYMENT_STATUS,
  type IPaymentRepository,
} from '../../../../payment/contracts';
import { CancellationPreviewOutput } from '../../dto/cancellation-preview.output';
import type { AssertReservationAccessService } from '../../services/assert-reservation-access.service';
import type { ComputeCancellationRefundService } from '../../services/compute-cancellation-refund.service';
import type { ResolveReservationCancellationPolicyService } from '../../services/resolve-reservation-cancellation-policy.service';
import type { GetCancellationPreviewQuery } from '../queries/GetCancellationPreviewQuery';

export class GetCancellationPreviewQueryHandler implements IQueryHandler<
  GetCancellationPreviewQuery,
  CancellationPreviewOutput
> {
  constructor(
    private readonly assertReservationAccess: AssertReservationAccessService,
    private readonly paymentRepository: IPaymentRepository,
    private readonly resolveCancellationPolicy: ResolveReservationCancellationPolicyService,
    private readonly computeCancellationRefund: ComputeCancellationRefundService,
  ) {}

  async execute(
    query: GetCancellationPreviewQuery,
  ): Promise<CancellationPreviewOutput> {
    const reservation = await this.assertReservationAccess.requireReservation(
      query.id,
    );
    await this.assertReservationAccess.assertCanManage(
      reservation,
      query.access,
    );

    const payment = reservation.paymentId
      ? await this.paymentRepository.findById(reservation.paymentId)
      : null;

    if (!payment?.id) {
      throw new NotFoundException('Paiement introuvable.');
    }

    const checkIn = reservation.items[0]?.checkIn;
    if (!checkIn) {
      throw new BadRequestException('Séjour invalide.');
    }

    const policy = await this.resolveCancellationPolicy.resolve(reservation);
    const paymentAmount =
      payment.status === PAYMENT_STATUS.SUCCEEDED ? payment.amount : 0;
    const refund = this.computeCancellationRefund.compute({
      paymentAmount,
      checkIn,
      policy,
    });

    return new CancellationPreviewOutput(
      reservation.id!,
      refund.refundAmount,
      refund.refundPercent,
      refund.policyLabel,
      policy,
      payment.amount,
      payment.currency,
    );
  }
}
