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
import { Reservation } from '../../domain/entities/reservation.entity';
import {
  RESERVATION_REPOSITORY,
  type IReservationRepository,
} from '../../domain/repositories/reservation.repository';
import type { CreateReservationDto } from '../dto/create-reservation.dto';
import { ReservationOutput } from '../dto/reservation.output';
import { CheckRoomAvailabilityService } from '../services/check-room-availability.service';

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
  ) {}

  async execute(
    authId: number,
    dto: CreateReservationDto,
  ): Promise<ReservationOutput> {
    const user = await this.userRepository.findByAuthId(authId);
    if (!user?.id) {
      throw new UnauthorizedException('Utilisateur introuvable.');
    }

    const room = await this.roomRepository.findById(dto.roomId);
    if (!room?.id) {
      throw new NotFoundException('Chambre introuvable.');
    }

    if (room.status !== 'available') {
      throw new BadRequestException('Cette chambre n’est pas disponible.');
    }

    if (dto.guestCount > room.maxGuests) {
      throw new BadRequestException(
        `Cette chambre accepte au maximum ${room.maxGuests} voyageurs.`,
      );
    }

    const stayAmount = this.calculateStayAmount.execute({
      checkIn: dto.startDate,
      checkOut: dto.endDate,
      pricePerNight: room.pricePerNight,
    });

    await this.checkRoomAvailability.ensureAvailable(
      room.id,
      dto.startDate,
      dto.endDate,
    );

    const reservation = await this.reservationRepository.create(
      new Reservation(
        room.id,
        user.id,
        dto.startDate,
        dto.endDate,
        dto.guestCount,
        stayAmount.amountInMajorUnit,
        stayAmount.nights,
        RESERVATION_STATUS.PENDING,
      ),
    );

    return ReservationOutput.fromDomain(reservation);
  }
}
