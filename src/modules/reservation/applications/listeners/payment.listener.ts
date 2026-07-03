import {
  type IReservationRepository,
  RESERVATION_REPOSITORY,
} from '../../domain/repositories/reservation.repository';
import { Inject } from '@nestjs/common';
import { EventBus } from '../../../../shared/domain/event.bus';

export class PaymentListener {
  constructor(
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: IReservationRepository,
  ) {}

  async listen(): Promise<void> {
    EventBus.getInstance().subscribe('payment.created', async (payload) => {
      const reservation = await this.reservationRepository.findById(
        payload.propertyId,
      );

      if (!reservation) {
        throw new Error('Reservation not found');
      }

      reservation.paymentId = payload.paymentId;

      await this.reservationRepository.setPayment(
        reservation,
        payload.paymentId,
      );
    });
  }
}
