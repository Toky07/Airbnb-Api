import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import type { ICommandHandler } from '../../../../../shared/useCase/bus/command-handler.interface';
import type { RoomStayPricingService } from '../../../../rooms/applications/services/room-stay-pricing.service';
import type { IRoomRepository } from '../../../../rooms/domain/repositories/room.repository';
import type { IUserRepository } from '../../../../user/domain/repositories/user.repository';
import type { Room } from '../../../../rooms/domain/entities/room.entity';
import { computeReservationHoldUntil } from '../../../domain/constants/reservation-hold.constant';
import { RESERVATION_STATUS } from '../../../domain/constants/reservation-status.constant';
import { ReservationItem } from '../../../domain/entities/reservation-item.entity';
import { Reservation } from '../../../domain/entities/reservation.entity';
import type { IReservationRepository } from '../../../domain/repositories/reservation.repository';
import { ReservationOutput } from '../../dto/reservation.output';
import type { EnrichReservationOutputsService } from '../../services/enrich-reservation-outputs.service';
import type { CreateReservationCommand } from '../commands/CreateReservationCommand';

export class CreateReservationCommandHandler implements ICommandHandler<
  CreateReservationCommand,
  ReservationOutput
> {
  constructor(
    private readonly reservationRepository: IReservationRepository,
    private readonly roomRepository: IRoomRepository,
    private readonly userRepository: IUserRepository,
    private readonly roomStayPricing: RoomStayPricingService,
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

      this.ensureRoomBasics(room, input.guestCount);

      const stayAmount = await this.roomStayPricing.resolveForRoom(
        room,
        input.startDate,
        input.endDate,
      );

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

    const holdUntil = computeReservationHoldUntil();
    const reservation = await this.reservationRepository.createWithHold(
      new Reservation(
        user.id,
        items,
        RESERVATION_STATUS.PENDING,
        null,
        undefined,
        undefined,
        undefined,
        holdUntil,
      ),
    );

    const [enriched] = await this.enrichReservationOutputs.enrich([
      ReservationOutput.fromDomain(reservation),
    ]);

    return enriched ?? ReservationOutput.fromDomain(reservation);
  }

  private ensureRoomBasics(room: Room, guestCount: number): void {
    if (room.status !== 'available') {
      throw new BadRequestException('Cette chambre n’est pas disponible.');
    }

    if (guestCount > room.maxGuests) {
      throw new BadRequestException(
        `Cette chambre accepte au maximum ${room.maxGuests} voyageurs.`,
      );
    }
  }
}
