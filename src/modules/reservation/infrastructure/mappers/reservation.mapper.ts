import type { ReservationStatus } from '../../domain/constants/reservation-status.constant';
import { Reservation } from '../../domain/entities/reservation.entity';
import { ReservationOrmEntity } from '../entities/reservation.orm-entity';

export class ReservationMapper {
  static toDomain(entity: ReservationOrmEntity): Reservation {
    return new Reservation(
      entity.roomId,
      entity.userId,
      entity.startDate,
      entity.endDate,
      entity.guestCount,
      entity.totalPrice,
      entity.nights,
      entity.status as ReservationStatus,
      entity.id,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static toEntity(reservation: Reservation): ReservationOrmEntity {
    const entity = new ReservationOrmEntity();
    if (reservation.id !== undefined) {
      entity.id = reservation.id;
    }
    entity.roomId = reservation.roomId;
    entity.userId = reservation.userId;
    entity.startDate = reservation.startDate;
    entity.endDate = reservation.endDate;
    entity.guestCount = reservation.guestCount;
    entity.totalPrice = reservation.totalPrice;
    entity.nights = reservation.nights;
    entity.status = reservation.status;
    return entity;
  }
}
