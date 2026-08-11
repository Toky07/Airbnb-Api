/**
 * Surface publique du module reservation.
 * Les autres modules doivent importer uniquement depuis ce barrel
 * (sauf ReservationModule Nest et ORM).
 */
export type { IReservationByIdReader } from '@src/modules/reservation/domain/repositories/reservation-by-id.reader';
export {
  RESERVATION_REPOSITORY,
  type IReservationRepository,
  type ReservationListParams,
  type ReservationStatsScope,
} from '@src/modules/reservation/domain/repositories/reservation.repository';
export {
  RESERVATION_STATUS,
  BLOCKING_RESERVATION_STATUSES,
  type ReservationStatus,
} from '@src/modules/reservation/domain/constants/reservation-status.constant';
export {
  CANCELLATION_POLICY,
  CANCELLATION_POLICY_LABELS,
  DEFAULT_CANCELLATION_POLICY,
  isCancellationPolicy,
  parseCancellationPolicy,
  type CancellationPolicy,
} from './cancellation-policy';
export { Reservation } from '@src/modules/reservation/domain/entities/reservation.entity';
export { ReservationItem } from '@src/modules/reservation/domain/entities/reservation-item.entity';
export { ReservationConfirmedEvent } from '@src/modules/reservation/domain/events/reservation-confirmed.event';
export { CancelReservationCommand } from '@src/modules/reservation/applications/useCase/commands/CancelReservationCommand';
export { MarkReservationNoShowCommand } from '@src/modules/reservation/applications/useCase/commands/MarkReservationNoShowCommand';
