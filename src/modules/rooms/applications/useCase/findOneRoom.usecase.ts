import { Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ROOM_REPOSITORY, type IRoomRepository } from '../../domain/repositories/room.repository';
import { BLOCKING_RESERVATION_STATUSES } from '../../../reservation/domain/constants/reservation-status.constant';
import { ReservationOrmEntity } from '../../../reservation/infrastructure/entities/reservation.orm-entity';
import type { UnavailableDateRange } from '../dto/room.output';
import { RoomMediaPresenter } from '../presenters/room-media.presenter';

export class FindOneRoomUseCase {
    constructor(
        @Inject(ROOM_REPOSITORY) private readonly repository: IRoomRepository,
        private readonly presenter: RoomMediaPresenter,
        @InjectRepository(ReservationOrmEntity)
        private readonly reservationRepo: Repository<ReservationOrmEntity>,
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

        const [output, unavailableDates] = await Promise.all([
            this.presenter.toOutput(room),
            this.findUnavailableDates(room.id!),
        ]);

        return { ...output, unavailableDates };
    }

    private async findUnavailableDates(roomId: number): Promise<UnavailableDateRange[]> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = this.formatDate(today);

        const reservations = await this.reservationRepo
            .createQueryBuilder('r')
            .select(['r.startDate', 'r.endDate'])
            .where('r.roomId = :roomId', { roomId })
            .andWhere('r.status IN (:...statuses)', {
                statuses: BLOCKING_RESERVATION_STATUSES,
            })
            .andWhere('r.endDate > :today', { today: todayStr })
            .getMany();

        return reservations.map((r) => ({
            startDate: r.startDate,
            endDate: r.endDate,
        }));
    }

    private formatDate(date: Date): string {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }
}
