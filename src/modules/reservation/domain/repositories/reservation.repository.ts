import type {
  PaginatedResult,
  PaginationParams,
} from '@src/shared/pagination/pagination.types';
import type { Reservation } from '@src/modules/reservation/domain/entities/reservation.entity';
import type { ReservationItem } from '@src/modules/reservation/domain/entities/reservation-item.entity';
import { ReservationStatus } from '@src/modules/reservation/domain/constants/reservation-status.constant';
import type { IReservationByIdReader } from './reservation-by-id.reader';

export const RESERVATION_REPOSITORY = 'RESERVATION_REPOSITORY';

export type ReservationListParams = PaginationParams & {
  roomId?: number;
  userId?: number;
  propertyId?: number;
  propertyIds?: number[];
};

export type ReservationStatsScope = {
  propertyId?: number;
  propertyIds?: number[];
};

export interface IReservationRepository extends IReservationByIdReader {
  update(reservation: Reservation): Promise<Reservation>;
  setPayment(reservation: Reservation, paymentId: number): Promise<void>;
  findPaginated(
    params: ReservationListParams,
  ): Promise<PaginatedResult<Reservation>>;
  findOverlapping(
    roomId: number,
    checkIn: string,
    checkOut: string,
    excludeReservationId?: number,
  ): Promise<ReservationItem[]>;
  createWithHold(reservation: Reservation): Promise<Reservation>;
  countByScope(
    scope: ReservationStatsScope,
    status?: ReservationStatus,
  ): Promise<number>;
  sumConfirmedRevenueForMonth(
    year: number,
    month: number,
    scope?: ReservationStatsScope,
  ): Promise<number>;
  sumConfirmedNightsForMonth(
    year: number,
    month: number,
    scope?: ReservationStatsScope,
  ): Promise<number>;
  findRecentItems(
    limit: number,
    scope?: ReservationStatsScope,
  ): Promise<ReservationItem[]>;
  findByIds(ids: number[]): Promise<Reservation[]>;
  findIdsByPropertyIds(propertyIds: number[]): Promise<number[]>;
  findByPaymentId(paymentId: number): Promise<Reservation | null>;
  clearExpiredReservations(): Promise<void>;
}
