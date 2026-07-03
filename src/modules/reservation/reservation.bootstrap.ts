import type { CalculateStayAmountService } from '../../shared/pricing/calculate-stay-amount.service';
import type { IPaymentRepository } from '../payment/domain/repositories/payment.repository';
import type { IPropertyRepository } from '../properties/domain/repositories/property.repository';
import type { IRoomRepository } from '../rooms/domain/repositories/room.repository';
import type { IUserRepository } from '../user/domain/repositories/user.repository';
import type { IReservationRepository } from './domain/repositories/reservation.repository';
import type { CheckRoomAvailabilityService } from './applications/services/check-room-availability.service';
import type { CountScopedRoomsService } from './applications/services/count-scoped-rooms.service';
import type { EnrichReservationOutputsService } from './applications/services/enrich-reservation-outputs.service';
import type { ResolveHostPropertyIdsService } from './applications/services/resolve-host-property-ids.service';
import type { ResolvePaymentReservationsService } from './applications/services/resolve-payment-reservations.service';
import type { ResolveReservationStatsScopeService } from './applications/services/resolve-reservation-stats-scope.service';
import { CreateReservationCommandHandler } from './applications/useCase/handlers/CreateReservationCommandHandler';
import { ConfirmReservationCommandHandler } from './applications/useCase/handlers/ConfirmReservationCommandHandler';
import { CancelReservationCommandHandler } from './applications/useCase/handlers/CancelReservationCommandHandler';
import { GetReservationQueryHandler } from './applications/useCase/handlers/GetReservationQueryHandler';
import { ListReservationsQueryHandler } from './applications/useCase/handlers/ListReservationsQueryHandler';
import { ListMyReservationsQueryHandler } from './applications/useCase/handlers/ListMyReservationsQueryHandler';
import { ListHostReservationsQueryHandler } from './applications/useCase/handlers/ListHostReservationsQueryHandler';
import { GetReservationStatsQueryHandler } from './applications/useCase/handlers/GetReservationStatsQueryHandler';
import { ListBookingOrdersQueryHandler } from './applications/useCase/handlers/ListBookingOrdersQueryHandler';
import { ListHostBookingOrdersQueryHandler } from './applications/useCase/handlers/ListHostBookingOrdersQueryHandler';
import { GetBookingOrderQueryHandler } from './applications/useCase/handlers/GetBookingOrderQueryHandler';

export class ReservationBootstrap {
  static create(deps: {
    reservationRepository: IReservationRepository;
    roomRepository: IRoomRepository;
    userRepository: IUserRepository;
    propertyRepository: IPropertyRepository;
    paymentRepository: IPaymentRepository;
    checkRoomAvailability: CheckRoomAvailabilityService;
    calculateStayAmount: CalculateStayAmountService;
    enrichReservationOutputs: EnrichReservationOutputsService;
    resolvePaymentReservations: ResolvePaymentReservationsService;
    resolveHostPropertyIds: ResolveHostPropertyIdsService;
    resolveReservationStatsScope: ResolveReservationStatsScopeService;
    countScopedRooms: CountScopedRoomsService;
  }) {
    const listReservationsQueryHandler = new ListReservationsQueryHandler(
      deps.reservationRepository,
      deps.enrichReservationOutputs,
    );

    const listBookingOrdersQueryHandler = new ListBookingOrdersQueryHandler(
      deps.paymentRepository,
      deps.userRepository,
      deps.resolvePaymentReservations,
    );

    return {
      createReservationCommandHandler: new CreateReservationCommandHandler(
        deps.reservationRepository,
        deps.roomRepository,
        deps.userRepository,
        deps.checkRoomAvailability,
        deps.calculateStayAmount,
        deps.enrichReservationOutputs,
      ),
      confirmReservationCommandHandler: new ConfirmReservationCommandHandler(
        deps.reservationRepository,
      ),
      cancelReservationCommandHandler: new CancelReservationCommandHandler(
        deps.reservationRepository,
        deps.userRepository,
        deps.paymentRepository,
      ),
      getReservationQueryHandler: new GetReservationQueryHandler(
        deps.reservationRepository,
        deps.userRepository,
        deps.roomRepository,
        deps.propertyRepository,
        deps.enrichReservationOutputs,
      ),
      listReservationsQueryHandler,
      listMyReservationsQueryHandler: new ListMyReservationsQueryHandler(
        deps.userRepository,
        listReservationsQueryHandler,
      ),
      listHostReservationsQueryHandler: new ListHostReservationsQueryHandler(
        deps.resolveHostPropertyIds,
        listReservationsQueryHandler,
      ),
      getReservationStatsQueryHandler: new GetReservationStatsQueryHandler(
        deps.reservationRepository,
        deps.resolveReservationStatsScope,
        deps.countScopedRooms,
        deps.enrichReservationOutputs,
        deps.userRepository,
      ),
      listBookingOrdersQueryHandler,
      listHostBookingOrdersQueryHandler: new ListHostBookingOrdersQueryHandler(
        deps.paymentRepository,
        deps.reservationRepository,
        deps.resolveHostPropertyIds,
        listBookingOrdersQueryHandler,
      ),
      getBookingOrderQueryHandler: new GetBookingOrderQueryHandler(
        deps.paymentRepository,
        deps.userRepository,
        deps.propertyRepository,
        deps.resolvePaymentReservations,
      ),
    };
  }
}
