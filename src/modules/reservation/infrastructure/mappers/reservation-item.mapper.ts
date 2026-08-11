import { ReservationItem } from '@src/modules/reservation/domain/entities/reservation-item.entity';
import { ReservationItemOrmEntity } from '@src/modules/reservation/infrastructure/entities/reservation-item.orm-entity';

export class ReservationItemMapper {
  static toDomain(entity: ReservationItemOrmEntity): ReservationItem {
    return new ReservationItem(
      entity.reservationId,
      entity.roomId,
      entity.checkIn,
      entity.checkOut,
      entity.guestCount,
      entity.price,
      entity.nights,
      entity.id,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static toEntity(item: ReservationItem): ReservationItemOrmEntity {
    const entity = new ReservationItemOrmEntity();
    if (item.id) {
      entity.id = item.id;
    }
    entity.reservationId = item.reservationId;
    entity.roomId = item.roomId;
    entity.checkIn = item.checkIn;
    entity.checkOut = item.checkOut;
    entity.guestCount = item.guestCount;
    entity.price = item.price;
    entity.nights = item.nights;
    return entity;
  }
}
