import { DomainEvent } from '@src/shared/domain/domain.event';
import type { Reservation } from '@src/modules/reservation/domain/entities/reservation.entity';

export class ReservationConfirmedEvent implements DomainEvent {
  eventName = 'reservation.confirmed';
  occurredOn = new Date();

  constructor(public readonly reservation: Reservation) {}
}
