import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalculateStayAmountService } from '../../shared/pricing/calculate-stay-amount.service';
import { PropertiesModule } from '../properties/properties.module';
import { RoomsModule } from '../rooms/room.module';
import { UserModule } from '../user/user.module';
import { CheckRoomAvailabilityService } from './applications/services/check-room-availability.service';
import { CancelReservationUseCase } from './applications/useCase/cancel-reservation.usecase';
import { ConfirmReservationUseCase } from './applications/useCase/confirm-reservation.usecase';
import { CreateReservationUseCase } from './applications/useCase/create-reservation.usecase';
import { GetReservationUseCase } from './applications/useCase/get-reservation.usecase';
import { ListHostReservationsUseCase } from './applications/useCase/list-host-reservations.usecase';
import { ListMyReservationsUseCase } from './applications/useCase/list-my-reservations.usecase';
import { ListReservationsUseCase } from './applications/useCase/list-reservations.usecase';
import { RESERVATION_REPOSITORY } from './domain/repositories/reservation.repository';
import { ReservationOrmEntity } from './infrastructure/entities/reservation.orm-entity';
import { ReservationRepository } from './infrastructure/repositories/reservation.repository';
import { ReservationController } from './interfaces/http/reservation.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReservationOrmEntity]),
    RoomsModule,
    UserModule,
    PropertiesModule,
  ],
  controllers: [ReservationController],
  providers: [
    ReservationRepository,
    {
      provide: RESERVATION_REPOSITORY,
      useClass: ReservationRepository,
    },
    CalculateStayAmountService,
    CheckRoomAvailabilityService,
    CreateReservationUseCase,
    ListReservationsUseCase,
    ListMyReservationsUseCase,
    ListHostReservationsUseCase,
    GetReservationUseCase,
    CancelReservationUseCase,
    ConfirmReservationUseCase,
  ],
  exports: [
    RESERVATION_REPOSITORY,
    ConfirmReservationUseCase,
    CreateReservationUseCase,
    CheckRoomAvailabilityService,
    CalculateStayAmountService,
  ],
})
export class ReservationModule {}
