/**
 * Surface publique du module reservation.
 * Les autres modules doivent importer uniquement depuis ce barrel
 * (sauf ReservationModule Nest et ORM).
 */
export {
  RESERVATION_REPOSITORY,
  type IReservationRepository,
  type ReservationListParams,
  type ReservationStatsScope,
} from '../domain/repositories/reservation.repository';
export {
  RESERVATION_STATUS,
  BLOCKING_RESERVATION_STATUSES,
  type ReservationStatus,
} from '../domain/constants/reservation-status.constant';
export {
  CANCELLATION_POLICY,
  CANCELLATION_POLICY_LABELS,
  DEFAULT_CANCELLATION_POLICY,
  isCancellationPolicy,
  parseCancellationPolicy,
  type CancellationPolicy,
} from './cancellation-policy';
export { Reservation } from '../domain/entities/reservation.entity';
export { ReservationItem } from '../domain/entities/reservation-item.entity';
export { ReservationConfirmedEvent } from '../domain/events/reservation-confirmed.event';
export { CancelReservationCommand } from '../applications/useCase/commands/CancelReservationCommand';
export { MarkReservationNoShowCommand } from '../applications/useCase/commands/MarkReservationNoShowCommand';
