import { DomainEvent } from '../../../../shared/domain/domain.event';
import type { Reservation } from '../entities/reservation.entity';

export class ReservationConfirmedEvent implements DomainEvent {
  eventName = 'reservation.confirmed';
  occurredOn = new Date();

  constructor(public readonly reservation: Reservation) {}
}
