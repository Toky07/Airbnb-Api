import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { ICommandHandler } from '@src/shared/useCase/bus/command-handler.interface';
import {
  PAYMENT_STATUS,
  Payment,
  type IPaymentGateway,
  type IPaymentRepository,
} from '@src/modules/payment/contracts';
import { RESERVATION_STATUS } from '@src/modules/reservation/domain/constants/reservation-status.constant';
import { Reservation } from '@src/modules/reservation/domain/entities/reservation.entity';
import type { IReservationRepository } from '@src/modules/reservation/domain/repositories/reservation.repository';
import { CancelReservationOutput } from '@src/modules/reservation/applications/dto/cancel-reservation.output';
import { ReservationOutput } from '@src/modules/reservation/applications/dto/reservation.output';
import type { AssertReservationAccessService } from '@src/modules/reservation/applications/services/assert-reservation-access.service';
import type { ComputeCancellationRefundService } from '@src/modules/reservation/applications/services/compute-cancellation-refund.service';
import type { EnrichReservationOutputsService } from '@src/modules/reservation/applications/services/enrich-reservation-outputs.service';
import type { ResolveReservationCancellationPolicyService } from '@src/modules/reservation/applications/services/resolve-reservation-cancellation-policy.service';
import type { CancelReservationCommand } from '@src/modules/reservation/applications/useCase/commands/CancelReservationCommand';

export class CancelReservationCommandHandler implements ICommandHandler<
  CancelReservationCommand,
  CancelReservationOutput
> {
  constructor(
    private readonly reservationRepository: IReservationRepository,
    private readonly paymentRepository: IPaymentRepository,
    private readonly assertReservationAccess: AssertReservationAccessService,
    private readonly resolveCancellationPolicy: ResolveReservationCancellationPolicyService,
    private readonly computeCancellationRefund: ComputeCancellationRefundService,
    private readonly paymentGateway: IPaymentGateway,
    private readonly enrichReservationOutputs: EnrichReservationOutputsService,
  ) {}

  async execute(
    command: CancelReservationCommand,
  ): Promise<CancelReservationOutput> {
    const reservation = await this.reservationRepository.findById(command.id);

    if (!reservation?.id) {
      throw new NotFoundException('Réservation introuvable.');
    }

    const payment = reservation.paymentId
      ? await this.paymentRepository.findById(reservation.paymentId)
      : null;

    if (!payment?.id) {
      throw new NotFoundException('Paiement introuvable.');
    }

    if (reservation.status === RESERVATION_STATUS.CANCELLED) {
      throw new BadRequestException('Ce séjour est déjà annulé.');
    }

    if (reservation.status === RESERVATION_STATUS.NO_SHOW) {
      throw new BadRequestException('Ce séjour est déjà marqué no-show.');
    }

    await this.assertReservationAccess.assertCanManage(reservation, {
      authId: command.access.authId,
      canReadAll: command.access.canCancelAll,
      canReadHost: command.access.canCancelHost,
    });

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

    let updatedPayment = payment;
    if (
      refund.refundAmount > 0 &&
      payment.status === PAYMENT_STATUS.SUCCEEDED &&
      payment.transactionId
    ) {
      const stripeRefund = await this.paymentGateway.createRefund(
        payment.transactionId,
        refund.refundAmount,
        { refundApplicationFee: refund.refundAmount === payment.amount },
      );
      updatedPayment = await this.paymentRepository.update(
        Payment.create({
          ...payment,
          refundedAmount: payment.refundedAmount + refund.refundAmount,
          refundTransactionId: stripeRefund.id,
        }),
      );
    }

    const updated = await this.reservationRepository.update(
      new Reservation(
        reservation.userId,
        reservation.items,
        RESERVATION_STATUS.CANCELLED,
        updatedPayment.id,
        reservation.id,
        reservation.createdAt,
        reservation.updatedAt,
        null,
      ),
    );

    const [reservationOutput] = await this.enrichReservationOutputs.enrich([
      ReservationOutput.fromDomain(updated),
    ]);

    return new CancelReservationOutput(
      reservationOutput ?? ReservationOutput.fromDomain(updated),
      refund.refundAmount,
      refund.refundPercent,
      refund.policyLabel,
    );
  }
}
