import { Inject } from '@nestjs/common';
import { EventBus } from '../../../../shared/domain/event.bus';
import { PaymentCreatedEvent } from '../../../payment/domain/events/payment-created.event';
import {
  type IReservationRepository,
  RESERVATION_REPOSITORY,
} from '../../domain/repositories/reservation.repository';

export class PaymentListener {
  constructor(
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: IReservationRepository,
  ) {}

  async listen(): Promise<void> {
    EventBus.getInstance().subscribe(
      'payment.created',
      async (event: PaymentCreatedEvent) => {
        const reservation = await this.reservationRepository.findById(
          event.propertyId,
        );

        if (!reservation) {
          throw new Error('Reservation not found');
        }

        reservation.paymentId = event.paymentId;

        await this.reservationRepository.setPayment(
          reservation,
          event.paymentId,
        );
      },
    );
  }
}
