import { Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ListPropertyAmenitiesUseCase } from '../../../amenity/applications/useCase/list-property-amenities.usecase';
import { ListRoomAmenitiesUseCase } from '../../../amenity/applications/useCase/list-room-amenities.usecase';
import { ROOM_REPOSITORY, type IRoomRepository } from '../../domain/repositories/room.repository';
import { BLOCKING_RESERVATION_STATUSES } from '../../../reservation/domain/constants/reservation-status.constant';
import { ReservationItemOrmEntity } from '../../../reservation/infrastructure/entities/reservation-item.orm-entity';
import type { UnavailableDateRange } from '../dto/room.output';
import { RoomMediaPresenter } from '../presenters/room-media.presenter';

export class FindOneRoomUseCase {
    constructor(
        @Inject(ROOM_REPOSITORY) private readonly repository: IRoomRepository,
        private readonly presenter: RoomMediaPresenter,
        private readonly listRoomAmenitiesUseCase: ListRoomAmenitiesUseCase,
        private readonly listPropertyAmenitiesUseCase: ListPropertyAmenitiesUseCase,
        @InjectRepository(ReservationItemOrmEntity)
        private readonly reservationItemRepo: Repository<ReservationItemOrmEntity>,
    ) {}

    async execute(id: number) {
        return this.resolve(await this.repository.findById(id));
    }

    async executeBySlug(slug: string) {
        return this.resolve(await this.repository.findBySlug(slug));
    }

    private async resolve(room: Awaited<ReturnType<IRoomRepository['findById']>>) {
        if (!room) {
            throw new Error('Room not found');
        }

        const propertyId = room.property?.id;
        const [output, unavailableDates, amenities, propertyAmenities] = await Promise.all([
            this.presenter.toOutput(room),
            this.findUnavailableDates(room.id!),
            this.listRoomAmenitiesUseCase.execute(room.id!),
            propertyId
                ? this.listPropertyAmenitiesUseCase.execute(propertyId)
                : Promise.resolve([]),
        ]);

        return {
            ...output,
            unavailableDates,
            amenities,
            propertyAmenities,
        };
    }

    private async findUnavailableDates(roomId: number): Promise<UnavailableDateRange[]> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = this.formatDate(today);

        const reservations = await this.reservationItemRepo
            .createQueryBuilder('item')
            .select(['item.checkIn', 'item.checkOut'])
            .where('item.roomId = :roomId', { roomId })
            .andWhere('item.status IN (:...statuses)', {
                statuses: BLOCKING_RESERVATION_STATUSES,
            })
            .andWhere('item.checkOut > :today', { today: todayStr })
            .getMany();

        return reservations.map((item) => ({
            startDate: item.checkIn,
            endDate: item.checkOut,
        }));
    }

    private formatDate(date: Date): string {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }
}
