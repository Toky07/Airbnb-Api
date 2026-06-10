import type {
  PaginatedResult,
  PaginationParams,
} from '../../../../shared/pagination/pagination.types';
import type { Reservation } from '../entities/reservation.entity';

export const RESERVATION_REPOSITORY = 'RESERVATION_REPOSITORY';

export type ReservationListParams = PaginationParams & {
  roomId?: number;
  userId?: number;
  propertyId?: number;
};

export interface IReservationRepository {
  create(reservation: Reservation): Promise<Reservation>;
  update(reservation: Reservation): Promise<Reservation>;
  findById(id: number): Promise<Reservation | null>;
  findPaginated(params: ReservationListParams): Promise<PaginatedResult<Reservation>>;
  findOverlapping(
    roomId: number,
    startDate: string,
    endDate: string,
    excludeReservationId?: number,
  ): Promise<Reservation[]>;
}
