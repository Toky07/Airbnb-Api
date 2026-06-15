import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CalculateStayAmountService } from '../../../../shared/pricing/calculate-stay-amount.service';
import {
  ROOM_REPOSITORY,
  type IRoomRepository,
} from '../../../rooms/domain/repositories/room.repository';
import { USER_REPOSITORY } from '../../../user/infrastructure/repositories/user.repository';
import type { IUserRepository } from '../../../user/domain/repositories/user.repository';
import { RESERVATION_STATUS } from '../../domain/constants/reservation-status.constant';
import { ReservationItem } from '../../domain/entities/reservation-item.entity';
import { Reservation } from '../../domain/entities/reservation.entity';
import {
  RESERVATION_REPOSITORY,
  type IReservationRepository,
} from '../../domain/repositories/reservation.repository';
import type { CreateReservationDto } from '../dto/create-reservation.dto';
import { ReservationOutput } from '../dto/reservation.output';
import { CheckRoomAvailabilityService } from '../services/check-room-availability.service';
import { EnrichReservationOutputsService } from '../services/enrich-reservation-outputs.service';
import { Room } from 'src/modules/rooms/domain/entities/room.entity';

export type CreateReservationItemInput = {
  roomId: number;
  checkIn: string;
  checkOut: string;
  guestCount: number;
};

@Injectable()
export class CreateReservationUseCase {
  constructor(
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: IReservationRepository,
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly checkRoomAvailability: CheckRoomAvailabilityService,
    private readonly calculateStayAmount: CalculateStayAmountService,
    private readonly enrichReservationOutputs: EnrichReservationOutputsService,
  ) {}

  async execute(
    authId: number,
    dtos: CreateReservationDto[],
  ): Promise<ReservationOutput> {
    if (dtos.length === 0) {
      throw new BadRequestException('Au moins un séjour est requis.');
    }

    const user = await this.userRepository.findByAuthId(authId);
    if (!user?.id) {
      throw new UnauthorizedException('Utilisateur introuvable.');
    }

    const items: ReservationItem[] = [];

    for (const input of dtos) {
      const room = await this.roomRepository.findById(input.roomId);
      if (!room?.id) {
        throw new NotFoundException('Chambre introuvable.');
      }

      await this.isRoomAvailable(room, input.guestCount, input.startDate, input.endDate);

      const stayAmount = this.calculateStayAmount.execute({
        checkIn: input.startDate,
        checkOut: input.endDate,
        pricePerNight: room.pricePerNight,
      });
      
      items.push(
        new ReservationItem(
          0,
          room.id,
          input.startDate,
          input.endDate,
          input.guestCount,
          stayAmount.amountInMajorUnit,
          stayAmount.nights,
        ),
      );
    }

    const reservation = await this.reservationRepository.create(
      new Reservation(user.id, items, RESERVATION_STATUS.PENDING),
    );

    const [enriched] = await this.enrichReservationOutputs.enrich([
      ReservationOutput.fromDomain(reservation),
    ]);

    return enriched ?? ReservationOutput.fromDomain(reservation);
  }

  private async isRoomAvailable(room: Room, guestCount: number, startDate: string, endDate: string): Promise<void> {
    if (room.status !== 'available') {
      throw new BadRequestException('Cette chambre n’est pas disponible.');
    }
    
    if (guestCount > room.maxGuests) {
      throw new BadRequestException(
        `Cette chambre accepte au maximum ${room.maxGuests} voyageurs.`,
      );
    }

    await this.checkRoomAvailability.ensureAvailable(room.id!, startDate, endDate);
  }
}
