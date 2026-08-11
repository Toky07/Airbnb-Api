import { Inject, Module, OnModuleInit, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { CalculateStayAmountService } from '@src/shared/pricing/calculate-stay-amount.service';
import { PaymentModule } from '@src/modules/payment/payment.module';
import { PropertiesModule } from '@src/modules/properties/properties.module';
import { RoomsModule } from '@src/modules/rooms/room.module';
import { RoomStayPricingService } from '@src/modules/rooms/contracts';
import { UserModule } from '@src/modules/user/user.module';
import { PROPERTY_REPOSITORY } from '@src/modules/properties/contracts';
import type { IPropertyRepository } from '@src/modules/properties/contracts';
import { ROOM_REPOSITORY } from '@src/modules/rooms/contracts';
import type { IRoomRepository } from '@src/modules/rooms/contracts';
import { USER_REPOSITORY } from '@src/modules/user/contracts';
import type { IUserRepository } from '@src/modules/user/contracts';
import {
  PAYMENT_GATEWAY,
  PAYMENT_REPOSITORY,
  type IPaymentGateway,
  type IPaymentRepository,
} from '@src/modules/payment/contracts';
import { CheckRoomAvailabilityService } from './applications/services/check-room-availability.service';
import { EnrichReservationOutputsService } from './applications/services/enrich-reservation-outputs.service';
import { ResolvePaymentReservationsService } from './applications/services/resolve-payment-reservations.service';
import { ResolveHostPropertyIdsService } from './applications/services/resolve-host-property-ids.service';
import { ResolveReservationStatsScopeService } from './applications/services/resolve-reservation-stats-scope.service';
import { CountScopedRoomsService } from './applications/services/count-scoped-rooms.service';
import { BuildReservationInvoicePayloadService } from './applications/services/build-reservation-invoice-payload.service';
import { BuildCustomerInvoiceEmailBodyService } from './applications/services/build-customer-invoice-email-body.service';
import { BuildHostPaymentNotificationEmailBodyService } from './applications/services/build-host-payment-notification-email-body.service';
import { ClearExpiredReservationService } from './applications/services/clear-expired-reservation.service';
import { ComputeCancellationRefundService } from './applications/services/compute-cancellation-refund.service';
import { AssertReservationAccessService } from './applications/services/assert-reservation-access.service';
import { ResolveReservationCancellationPolicyService } from './applications/services/resolve-reservation-cancellation-policy.service';
import {
  RESERVATION_REPOSITORY,
  type IReservationRepository,
} from './domain/repositories/reservation.repository';
import { ReservationItemOrmEntity } from './infrastructure/entities/reservation-item.orm-entity';
import { ReservationOrmEntity } from './infrastructure/entities/reservation.orm-entity';
import { ReservationRepository } from './infrastructure/repositories/reservation.repository';
import { ReservationController } from './interfaces/http/reservation.controller';
import { ReservationEvent } from './applications/events/register-reservation.event';
import { ReservationBootstrap } from './reservation.bootstrap';
import { CommandBus } from '@src/shared/useCase/bus/bus';
import { QueryBus } from '@src/shared/useCase/bus/query-bus';
import { CreateReservationCommand } from './applications/useCase/commands/CreateReservationCommand';
import { ConfirmReservationCommand } from './applications/useCase/commands/ConfirmReservationCommand';
import { CancelReservationCommand } from './applications/useCase/commands/CancelReservationCommand';
import { GetReservationQuery } from './applications/useCase/queries/GetReservationQuery';
import { ListReservationsQuery } from './applications/useCase/queries/ListReservationsQuery';
import { ListMyReservationsQuery } from './applications/useCase/queries/ListMyReservationsQuery';
import { ListHostReservationsQuery } from './applications/useCase/queries/ListHostReservationsQuery';
import { GetReservationStatsQuery } from './applications/useCase/queries/GetReservationStatsQuery';
import { ListBookingOrdersQuery } from './applications/useCase/queries/ListBookingOrdersQuery';
import { ListHostBookingOrdersQuery } from './applications/useCase/queries/ListHostBookingOrdersQuery';
import { GetBookingOrderQuery } from './applications/useCase/queries/GetBookingOrderQuery';
import { GetCancellationPreviewQuery } from './applications/useCase/queries/GetCancellationPreviewQuery';
import { MarkReservationNoShowCommand } from './applications/useCase/commands/MarkReservationNoShowCommand';
import { InvoiceModule } from '@src/modules/invoice/invoice.module';
import {
  INVOICE_REPOSITORY,
  type IInvoiceRepository,
} from '@src/modules/invoice/contracts';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReservationOrmEntity, ReservationItemOrmEntity]),
    ScheduleModule.forRoot(),
    forwardRef(() => PaymentModule),
    InvoiceModule,
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
    EnrichReservationOutputsService,
    ResolvePaymentReservationsService,
    ResolveHostPropertyIdsService,
    ResolveReservationStatsScopeService,
    CountScopedRoomsService,
    ClearExpiredReservationService,
    ComputeCancellationRefundService,
    AssertReservationAccessService,
    ResolveReservationCancellationPolicyService,
    ReservationEvent,
    BuildReservationInvoicePayloadService,
    BuildCustomerInvoiceEmailBodyService,
    BuildHostPaymentNotificationEmailBodyService,
  ],
  exports: [
    RESERVATION_REPOSITORY,
    CheckRoomAvailabilityService,
    CalculateStayAmountService,
    ResolvePaymentReservationsService,
  ],
})
export class ReservationModule implements OnModuleInit {
  constructor(
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: IReservationRepository,
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(PROPERTY_REPOSITORY)
    private readonly propertyRepository: IPropertyRepository,
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
    @Inject(PAYMENT_GATEWAY)
    private readonly paymentGateway: IPaymentGateway,
    private readonly checkRoomAvailability: CheckRoomAvailabilityService,
    private readonly roomStayPricing: RoomStayPricingService,
    private readonly enrichReservationOutputs: EnrichReservationOutputsService,
    private readonly resolvePaymentReservations: ResolvePaymentReservationsService,
    private readonly resolveHostPropertyIds: ResolveHostPropertyIdsService,
    private readonly resolveReservationStatsScope: ResolveReservationStatsScopeService,
    private readonly countScopedRooms: CountScopedRoomsService,
    private readonly assertReservationAccess: AssertReservationAccessService,
    private readonly resolveCancellationPolicy: ResolveReservationCancellationPolicyService,
    private readonly computeCancellationRefund: ComputeCancellationRefundService,
    @Inject(INVOICE_REPOSITORY)
    private readonly invoiceRepository: IInvoiceRepository,
  ) {}

  onModuleInit() {
    const bootstrap = ReservationBootstrap.create({
      reservationRepository: this.reservationRepository,
      roomRepository: this.roomRepository,
      userRepository: this.userRepository,
      propertyRepository: this.propertyRepository,
      paymentRepository: this.paymentRepository,
      paymentGateway: this.paymentGateway,
      checkRoomAvailability: this.checkRoomAvailability,
      roomStayPricing: this.roomStayPricing,
      enrichReservationOutputs: this.enrichReservationOutputs,
      resolvePaymentReservations: this.resolvePaymentReservations,
      resolveHostPropertyIds: this.resolveHostPropertyIds,
      resolveReservationStatsScope: this.resolveReservationStatsScope,
      countScopedRooms: this.countScopedRooms,
      assertReservationAccess: this.assertReservationAccess,
      resolveCancellationPolicy: this.resolveCancellationPolicy,
      computeCancellationRefund: this.computeCancellationRefund,
      invoiceRepository: this.invoiceRepository,
    });

    CommandBus.register(
      CreateReservationCommand,
      bootstrap.createReservationCommandHandler,
    );
    CommandBus.register(
      ConfirmReservationCommand,
      bootstrap.confirmReservationCommandHandler,
    );
    CommandBus.register(
      CancelReservationCommand,
      bootstrap.cancelReservationCommandHandler,
    );
    CommandBus.register(
      MarkReservationNoShowCommand,
      bootstrap.markReservationNoShowCommandHandler,
    );

    QueryBus.register(
      GetCancellationPreviewQuery,
      bootstrap.getCancellationPreviewQueryHandler,
    );
    QueryBus.register(
      GetReservationQuery,
      bootstrap.getReservationQueryHandler,
    );
    QueryBus.register(
      ListReservationsQuery,
      bootstrap.listReservationsQueryHandler,
    );
    QueryBus.register(
      ListMyReservationsQuery,
      bootstrap.listMyReservationsQueryHandler,
    );
    QueryBus.register(
      ListHostReservationsQuery,
      bootstrap.listHostReservationsQueryHandler,
    );
    QueryBus.register(
      GetReservationStatsQuery,
      bootstrap.getReservationStatsQueryHandler,
    );
    QueryBus.register(
      ListBookingOrdersQuery,
      bootstrap.listBookingOrdersQueryHandler,
    );
    QueryBus.register(
      ListHostBookingOrdersQuery,
      bootstrap.listHostBookingOrdersQueryHandler,
    );
    QueryBus.register(
      GetBookingOrderQuery,
      bootstrap.getBookingOrderQueryHandler,
    );
  }
}
