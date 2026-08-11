import type { Reservation } from '@src/modules/reservation/domain/entities/reservation.entity';

/**
 * Port étroit pour les modules externes qui ne font que charger une réservation.
 * Le token Nest reste RESERVATION_REPOSITORY (implémentation complète).
 */
export interface IReservationByIdReader {
  findById(id: number): Promise<Reservation | null>;
}
