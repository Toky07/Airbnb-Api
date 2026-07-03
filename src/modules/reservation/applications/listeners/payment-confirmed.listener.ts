import type { IReservationRepository } from '../../domain/repositories/reservation.repository';
import { EventBus } from '../../../../shared/domain/event.bus';
import { CommandBus } from '../../../../shared/useCase/bus/bus';
import type { BuildReservationInvoicePayloadService } from '../services/build-reservation-invoice-payload.service';
import { ConfirmReservationCommand } from '../useCase/commands/ConfirmReservationCommand';

export class PaymentConfirmedListener {
  constructor(
    private readonly reservationRepository: IReservationRepository,
    private readonly buildReservationInvoicePayload: BuildReservationInvoicePayloadService,
  ) {}

  async listen(): Promise<void> {
    EventBus.getInstance().subscribe('payment.confirmed', async (payload) => {
      const payment = payload.payment;

      if (!payment) {
        return;
      }

      const reservation = await this.reservationRepository.findByPaymentId(
        payment.id,
      );

      if (!reservation?.id) {
        throw new Error('Reservation not found');
      }

      await CommandBus.execute(new ConfirmReservationCommand(reservation.id));

      const context =
        await this.buildReservationInvoicePayload.execute(payment);
      if (!context) {
        return;
      }

      await EventBus.getInstance().publish(
        this.buildReservationInvoicePayload.toInvoiceGenerateEvent(
          payment,
          context,
        ),
      );
    });
  }
}
