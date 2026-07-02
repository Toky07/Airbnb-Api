import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import type { ICommandHandler } from '../../../../../shared/useCase/bus/command-handler.interface';
import type { CalculateStayAmountService } from '../../../../../shared/pricing/calculate-stay-amount.service';
import type { IRoomRepository } from '../../../../rooms/domain/repositories/room.repository';
import type { IUserRepository } from '../../../../user/domain/repositories/user.repository';
import type { Room } from '../../../../rooms/domain/entities/room.entity';
import { RESERVATION_STATUS } from '../../../domain/constants/reservation-status.constant';
import { ReservationItem } from '../../../domain/entities/reservation-item.entity';
import { Reservation } from '../../../domain/entities/reservation.entity';
import type { IReservationRepository } from '../../../domain/repositories/reservation.repository';
import { ReservationOutput } from '../../dto/reservation.output';
import type { CheckRoomAvailabilityService } from '../../services/check-room-availability.service';
import type { EnrichReservationOutputsService } from '../../services/enrich-reservation-outputs.service';
import type { CreateReservationCommand } from '../commands/CreateReservationCommand';

export class CreateReservationCommandHandler
  implements ICommandHandler<CreateReservationCommand, ReservationOutput>
{
  constructor(
    private readonly reservationRepository: IReservationRepository,
    private readonly roomRepository: IRoomRepository,
    private readonly userRepository: IUserRepository,
    private readonly checkRoomAvailability: CheckRoomAvailabilityService,
    private readonly calculateStayAmount: CalculateStayAmountService,
    private readonly enrichReservationOutputs: EnrichReservationOutputsService,
  ) {}

  async execute(command: CreateReservationCommand): Promise<ReservationOutput> {
    if (command.dtos.length === 0) {
      throw new BadRequestException('Au moins un séjour est requis.');
    }

    const user = await this.userRepository.findByAuthId(command.authId);
    if (!user?.id) {
      throw new UnauthorizedException('Utilisateur introuvable.');
    }

    const items: ReservationItem[] = [];

    for (const input of command.dtos) {
      const room = await this.roomRepository.findById(input.roomId);
      if (!room?.id) {
        throw new NotFoundException('Chambre introuvable.');
      }

      await this.ensureRoomAvailable(
        room,
        input.guestCount,
        input.startDate,
        input.endDate,
      );

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

  private async ensureRoomAvailable(
    room: Room,
    guestCount: number,
    startDate: string,
    endDate: string,
  ): Promise<void> {
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
