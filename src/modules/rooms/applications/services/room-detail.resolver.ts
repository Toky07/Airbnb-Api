import { NotFoundException } from '@nestjs/common';
import type { Repository } from 'typeorm';
import { QueryBus } from '../../../../shared/useCase/bus/query-bus';
import { ListPropertyAmenitiesQuery } from '../../../amenity/contracts';
import { ListRoomAmenitiesQuery } from '../../../amenity/contracts';
import type { IRoomRepository } from '../../domain/repositories/room.repository';
import type { IRoomBlockedDateRepository } from '../../domain/repositories/room-blocked-date.repository';
import type { ReservationItemOrmEntity } from '../../../reservation/infrastructure/entities/reservation-item.orm-entity';
import { BLOCKING_RESERVATION_STATUSES } from '../../../reservation/contracts';
import type { UnavailableDateRange } from '../dto/room.output';
import type { RoomMediaPresenter } from '../presenters/room-media.presenter';

export class RoomDetailResolver {
  constructor(
    private readonly presenter: RoomMediaPresenter,
    private readonly reservationItemRepo: Repository<ReservationItemOrmEntity>,
    private readonly blockedDateRepository: IRoomBlockedDateRepository,
  ) {}

  async resolve(room: Awaited<ReturnType<IRoomRepository['findById']>>) {
    if (!room) {
      throw new NotFoundException('Room not found');
    }

    const propertyId = room.property?.id;
    const [output, unavailableDates, amenities, propertyAmenities] =
      await Promise.all([
        this.presenter.toOutput(room),
        this.findUnavailableDates(room.id!),
        QueryBus.execute(new ListRoomAmenitiesQuery(room.id!)),
        propertyId
          ? QueryBus.execute(new ListPropertyAmenitiesQuery(propertyId))
          : Promise.resolve([]),
      ]);

    return {
      ...output,
      unavailableDates,
      amenities,
      propertyAmenities,
    };
  }

  private async findUnavailableDates(
    roomId: number,
  ): Promise<UnavailableDateRange[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = this.formatDate(today);

    const [reservations, blockedDates] = await Promise.all([
      this.reservationItemRepo
        .createQueryBuilder('item')
        .innerJoin('item.reservation', 'reservation')
        .select(['item.checkIn', 'item.checkOut'])
        .where('item.roomId = :roomId', { roomId })
        .andWhere('item.checkOut > :today', { today: todayStr })
        .andWhere('reservation.status IN (:...statuses)', {
          statuses: BLOCKING_RESERVATION_STATUSES,
        })
        .getMany(),
      this.blockedDateRepository.findByRoomId(roomId),
    ]);

    const fromReservations: UnavailableDateRange[] = reservations.map(
      (item) => ({
        startDate: item.checkIn,
        endDate: item.checkOut,
      }),
    );

    const fromBlocked: UnavailableDateRange[] = blockedDates
      .filter((blocked) => blocked.endDate > todayStr)
      .map((blocked) => ({
        startDate: blocked.startDate,
        endDate: blocked.endDate,
      }));

    return [...fromReservations, ...fromBlocked];
  }

  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
