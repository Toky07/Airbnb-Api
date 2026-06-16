import type { IReservationRepository } from '../../domain/repositories/reservation.repository';
import { EventBus } from '../../../../shared/domain/event.bus';
import { ConfirmReservationUseCase } from '../useCase/confirm-reservation.usecase';
import type { BuildReservationInvoicePayloadService } from '../services/build-reservation-invoice-payload.service';

export class PaymentConfirmedListener {
  private readonly confirmReservationUseCase: ConfirmReservationUseCase;

  constructor(
    private readonly reservationRepository: IReservationRepository,
    private readonly buildReservationInvoicePayload: BuildReservationInvoicePayloadService,
  ) {
    this.confirmReservationUseCase = new ConfirmReservationUseCase(
      this.reservationRepository,
    );
  }

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

      await this.confirmReservationUseCase.execute(reservation.id);

      const context = await this.buildReservationInvoicePayload.execute(payment);
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
