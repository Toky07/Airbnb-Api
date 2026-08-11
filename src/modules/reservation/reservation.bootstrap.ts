import type { RoomStayPricingService } from '@src/modules/rooms/contracts';
import type {
  IPaymentGateway,
  IPaymentRepository,
} from '@src/modules/payment/contracts';
import type { IPropertyRepository } from '@src/modules/properties/contracts';
import type { IRoomRepository } from '@src/modules/rooms/contracts';
import type { IUserRepository } from '@src/modules/user/contracts';
import type { IReservationRepository } from './domain/repositories/reservation.repository';
import type { AssertReservationAccessService } from './applications/services/assert-reservation-access.service';
import type { CheckRoomAvailabilityService } from './applications/services/check-room-availability.service';
import type { ComputeCancellationRefundService } from './applications/services/compute-cancellation-refund.service';
import type { CountScopedRoomsService } from './applications/services/count-scoped-rooms.service';
import type { EnrichReservationOutputsService } from './applications/services/enrich-reservation-outputs.service';
import type { ResolveHostPropertyIdsService } from './applications/services/resolve-host-property-ids.service';
import type { ResolvePaymentReservationsService } from './applications/services/resolve-payment-reservations.service';
import type { ResolveReservationCancellationPolicyService } from './applications/services/resolve-reservation-cancellation-policy.service';
import type { ResolveReservationStatsScopeService } from './applications/services/resolve-reservation-stats-scope.service';
import type { IInvoiceRepository } from '@src/modules/invoice/contracts';
import { CancelReservationCommandHandler } from './applications/useCase/handlers/CancelReservationCommandHandler';
import { ConfirmReservationCommandHandler } from './applications/useCase/handlers/ConfirmReservationCommandHandler';
import { CreateReservationCommandHandler } from './applications/useCase/handlers/CreateReservationCommandHandler';
import { GetBookingOrderQueryHandler } from './applications/useCase/handlers/GetBookingOrderQueryHandler';
import { GetCancellationPreviewQueryHandler } from './applications/useCase/handlers/GetCancellationPreviewQueryHandler';
import { GetReservationQueryHandler } from './applications/useCase/handlers/GetReservationQueryHandler';
import { GetReservationStatsQueryHandler } from './applications/useCase/handlers/GetReservationStatsQueryHandler';
import { ListBookingOrdersQueryHandler } from './applications/useCase/handlers/ListBookingOrdersQueryHandler';
import { ListHostBookingOrdersQueryHandler } from './applications/useCase/handlers/ListHostBookingOrdersQueryHandler';
import { ListHostReservationsQueryHandler } from './applications/useCase/handlers/ListHostReservationsQueryHandler';
import { ListMyReservationsQueryHandler } from './applications/useCase/handlers/ListMyReservationsQueryHandler';
import { ListReservationsQueryHandler } from './applications/useCase/handlers/ListReservationsQueryHandler';
import { MarkReservationNoShowCommandHandler } from './applications/useCase/handlers/MarkReservationNoShowCommandHandler';

export class ReservationBootstrap {
  static create(deps: {
    reservationRepository: IReservationRepository;
    roomRepository: IRoomRepository;
    userRepository: IUserRepository;
    propertyRepository: IPropertyRepository;
    paymentRepository: IPaymentRepository;
    paymentGateway: IPaymentGateway;
    checkRoomAvailability: CheckRoomAvailabilityService;
    roomStayPricing: RoomStayPricingService;
    enrichReservationOutputs: EnrichReservationOutputsService;
    resolvePaymentReservations: ResolvePaymentReservationsService;
    resolveHostPropertyIds: ResolveHostPropertyIdsService;
    resolveReservationStatsScope: ResolveReservationStatsScopeService;
    countScopedRooms: CountScopedRoomsService;
    assertReservationAccess: AssertReservationAccessService;
    resolveCancellationPolicy: ResolveReservationCancellationPolicyService;
    computeCancellationRefund: ComputeCancellationRefundService;
    invoiceRepository: IInvoiceRepository;
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
        deps.roomStayPricing,
        deps.enrichReservationOutputs,
      ),
      confirmReservationCommandHandler: new ConfirmReservationCommandHandler(
        deps.reservationRepository,
        deps.checkRoomAvailability,
      ),
      cancelReservationCommandHandler: new CancelReservationCommandHandler(
        deps.reservationRepository,
        deps.paymentRepository,
        deps.assertReservationAccess,
        deps.resolveCancellationPolicy,
        deps.computeCancellationRefund,
        deps.paymentGateway,
        deps.enrichReservationOutputs,
      ),
      markReservationNoShowCommandHandler:
        new MarkReservationNoShowCommandHandler(
          deps.reservationRepository,
          deps.userRepository,
          deps.roomRepository,
          deps.propertyRepository,
          deps.enrichReservationOutputs,
        ),
      getCancellationPreviewQueryHandler:
        new GetCancellationPreviewQueryHandler(
          deps.assertReservationAccess,
          deps.paymentRepository,
          deps.resolveCancellationPolicy,
          deps.computeCancellationRefund,
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
        deps.invoiceRepository,
      ),
    };
  }
}
