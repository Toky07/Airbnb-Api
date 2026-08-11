import type {
  PaginatedResult,
  PaginationParams,
} from '../../../../shared/pagination/pagination.types';
import type { Reservation } from '../entities/reservation.entity';
import type { ReservationItem } from '../entities/reservation-item.entity';
import { ReservationStatus } from '../constants/reservation-status.constant';
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
  create(reservation: Reservation): Promise<Reservation>;
  update(reservation: Reservation): Promise<Reservation>;
  setPayment(reservation: Reservation, paymentId: number): Promise<void>;
  findItemById(id: number): Promise<ReservationItem | null>;
  findItemsByIds(ids: number[]): Promise<ReservationItem[]>;
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
  findRoomIdsUnavailable(checkIn: string, checkOut: string): Promise<number[]>;
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
  findIdsByPropertyId(propertyId: number): Promise<number[]>;
  findIdsByPropertyIds(propertyIds: number[]): Promise<number[]>;
  findIdsByFilters(
    params: Omit<ReservationListParams, 'page' | 'limit'>,
  ): Promise<number[]>;
  findByPaymentId(paymentId: number): Promise<Reservation | null>;
  clearExpiredReservations(): Promise<void>;
}
