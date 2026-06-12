import { Reservation } from '../../domain/entities/reservation.entity';
import { ReservationOrmEntity } from '../entities/reservation.orm-entity';
import { ReservationItemMapper } from './reservation-item.mapper';

export class ReservationMapper {
  static toDomain(entity: ReservationOrmEntity): Reservation {
    return new Reservation(
      entity.userId,
      (entity.items ?? []).map((item) => ReservationItemMapper.toDomain(item)),
      entity.id,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static toEntity(reservation: Reservation): ReservationOrmEntity {
    const entity = new ReservationOrmEntity();
    if (reservation.id) {
      entity.id = reservation.id;
    }
    entity.userId = reservation.userId;
    entity.items = reservation.items.map((item) => {
      const itemEntity = ReservationItemMapper.toEntity(item);
      if (reservation.id) {
        itemEntity.reservationId = reservation.id;
      }
      return itemEntity;
    });
    return entity;
  }
}
