import { Inject, Module, OnModuleInit, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoomEntity } from './infrastructure/entities/room.entity';
import { RoomTypeEntity } from './infrastructure/entities/room-type.entity';
import { RoomBlockedDateOrmEntity } from './infrastructure/entities/room-blocked-date.orm-entity';
import { RoomRateOverrideOrmEntity } from './infrastructure/entities/room-rate-override.orm-entity';
import { ROOM_REPOSITORY } from './domain/repositories/room.repository';
import type { IRoomRepository } from './domain/repositories/room.repository';
import { ROOM_TYPE_REPOSITORY } from './domain/repositories/room-type.repository';
import type { IRoomTypeRepository } from './domain/repositories/room-type.repository';
import { ROOM_BLOCKED_DATE_REPOSITORY } from './domain/repositories/room-blocked-date.repository';
import type { IRoomBlockedDateRepository } from './domain/repositories/room-blocked-date.repository';
import { ROOM_RATE_OVERRIDE_REPOSITORY } from './domain/repositories/room-rate-override.repository';
import type { IRoomRateOverrideRepository } from './domain/repositories/room-rate-override.repository';
import { RoomRepository } from './infrastructure/repositories/room.repository';
import { RoomTypeRepository } from './infrastructure/repositories/room-type.repository';
import { RoomBlockedDateRepository } from './infrastructure/repositories/room-blocked-date.repository';
import { RoomRateOverrideRepository } from './infrastructure/repositories/room-rate-override.repository';
import { RoomController } from './interfaces/http/room.controller';
import { RoomTypeController } from './interfaces/http/room-type.controller';
import { RoomTypesSeedService } from './infrastructure/seed/room-types.seed';
import { RoomSlugsSeedService } from './infrastructure/seed/room-slugs.seed';
import { CalculateStayAmountService } from '../../shared/pricing/calculate-stay-amount.service';
import { ComputePricingBreakdownService } from '../../shared/pricing/compute-pricing-breakdown.service';
import { ResolveDynamicStayAmountService } from '../../shared/pricing/resolve-dynamic-stay-amount.service';
import { RoomStayPricingService } from './applications/services/room-stay-pricing.service';
import { MediaModule } from '../media/media.module';
import { RoomMediaPresenter } from './applications/presenters/room-media.presenter';
import { RoomProductSummaryService } from './applications/services/room-product-summary.service';
import { GenerateRoomSlugService } from './applications/services/generate-room-slug.service';
import { cartItemCatalogProvider } from './infrastructure/adapters/cart-item-catalog.adapter';
import { cartProductSummaryProvider } from './infrastructure/adapters/cart-product-summary.adapter';
import { ReservationItemOrmEntity } from '../reservation/infrastructure/entities/reservation-item.orm-entity';
import { AmenityModule } from '../amenity/amenity.module';
import { RoomsBootstrap } from './rooms.bootstrap';
import { CommandBus } from '../../shared/useCase/bus/bus';
import { QueryBus } from '../../shared/useCase/bus/query-bus';
import { CreateRoomCommand } from './applications/useCase/commands/CreateRoomCommand';
import { UpdateRoomCommand } from './applications/useCase/commands/UpdateRoomCommand';
import { DeleteRoomCommand } from './applications/useCase/commands/DeleteRoomCommand';
import { CreateRoomTypeCommand } from './applications/useCase/commands/CreateRoomTypeCommand';
import { UpdateRoomTypeCommand } from './applications/useCase/commands/UpdateRoomTypeCommand';
import { DeleteRoomTypeCommand } from './applications/useCase/commands/DeleteRoomTypeCommand';
import { CreateRoomBlockedDateCommand } from './applications/useCase/commands/CreateRoomBlockedDateCommand';
import { DeleteRoomBlockedDateCommand } from './applications/useCase/commands/DeleteRoomBlockedDateCommand';
import { CreateRoomRateOverrideCommand } from './applications/useCase/commands/CreateRoomRateOverrideCommand';
import { DeleteRoomRateOverrideCommand } from './applications/useCase/commands/DeleteRoomRateOverrideCommand';
import { FindRoomQuery } from './applications/useCase/queries/FindRoomQuery';
import { ListRoomsQuery } from './applications/useCase/queries/ListRoomsQuery';
import { ListRoomTypesQuery } from './applications/useCase/queries/ListRoomTypesQuery';
import { ListRoomTypeOptionsQuery } from './applications/useCase/queries/ListRoomTypeOptionsQuery';
import { ListRoomBlockedDatesQuery } from './applications/useCase/queries/ListRoomBlockedDatesQuery';
import { ListRoomRateOverridesQuery } from './applications/useCase/queries/ListRoomRateOverridesQuery';
import { GetRoomPricingPreviewQuery } from './applications/useCase/queries/GetRoomPricingPreviewQuery';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RoomEntity,
      RoomTypeEntity,
      RoomBlockedDateOrmEntity,
      RoomRateOverrideOrmEntity,
      ReservationItemOrmEntity,
    ]),
    MediaModule,
    forwardRef(() => AmenityModule),
  ],
  controllers: [RoomController, RoomTypeController],
  providers: [
    RoomTypesSeedService,
    RoomSlugsSeedService,
    RoomMediaPresenter,
    RoomProductSummaryService,
    GenerateRoomSlugService,
    CalculateStayAmountService,
    ResolveDynamicStayAmountService,
    RoomStayPricingService,
    ComputePricingBreakdownService,
    cartItemCatalogProvider,
    cartProductSummaryProvider,
    {
      provide: ROOM_REPOSITORY,
      useClass: RoomRepository,
    },
    {
      provide: ROOM_TYPE_REPOSITORY,
      useClass: RoomTypeRepository,
    },
    {
      provide: ROOM_BLOCKED_DATE_REPOSITORY,
      useClass: RoomBlockedDateRepository,
    },
    {
      provide: ROOM_RATE_OVERRIDE_REPOSITORY,
      useClass: RoomRateOverrideRepository,
    },
  ],
  exports: [
    ROOM_REPOSITORY,
    ROOM_TYPE_REPOSITORY,
    ROOM_BLOCKED_DATE_REPOSITORY,
    ROOM_RATE_OVERRIDE_REPOSITORY,
    RoomStayPricingService,
    RoomMediaPresenter,
    RoomProductSummaryService,
    cartItemCatalogProvider,
    cartProductSummaryProvider,
  ],
})
export class RoomsModule implements OnModuleInit {
  constructor(
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
    @Inject(ROOM_TYPE_REPOSITORY)
    private readonly roomTypeRepository: IRoomTypeRepository,
    @Inject(ROOM_BLOCKED_DATE_REPOSITORY)
    private readonly roomBlockedDateRepository: IRoomBlockedDateRepository,
    @Inject(ROOM_RATE_OVERRIDE_REPOSITORY)
    private readonly roomRateOverrideRepository: IRoomRateOverrideRepository,
    private readonly roomMediaPresenter: RoomMediaPresenter,
    private readonly generateRoomSlug: GenerateRoomSlugService,
    private readonly roomStayPricing: RoomStayPricingService,
    private readonly computePricingBreakdown: ComputePricingBreakdownService,
    @InjectRepository(ReservationItemOrmEntity)
    private readonly reservationItemRepo: Repository<ReservationItemOrmEntity>,
  ) {}

  onModuleInit() {
    const bootstrap = RoomsBootstrap.create({
      roomRepository: this.roomRepository,
      roomTypeRepository: this.roomTypeRepository,
      roomBlockedDateRepository: this.roomBlockedDateRepository,
      roomRateOverrideRepository: this.roomRateOverrideRepository,
      roomMediaPresenter: this.roomMediaPresenter,
      generateRoomSlug: this.generateRoomSlug,
      roomStayPricing: this.roomStayPricing,
      reservationItemRepo: this.reservationItemRepo,
      computePricingBreakdown: this.computePricingBreakdown,
    });

    CommandBus.register(CreateRoomCommand, bootstrap.createRoomCommandHandler);
    CommandBus.register(UpdateRoomCommand, bootstrap.updateRoomCommandHandler);
    CommandBus.register(DeleteRoomCommand, bootstrap.deleteRoomCommandHandler);
    CommandBus.register(
      CreateRoomTypeCommand,
      bootstrap.createRoomTypeCommandHandler,
    );
    CommandBus.register(
      UpdateRoomTypeCommand,
      bootstrap.updateRoomTypeCommandHandler,
    );
    CommandBus.register(
      DeleteRoomTypeCommand,
      bootstrap.deleteRoomTypeCommandHandler,
    );
    CommandBus.register(
      CreateRoomBlockedDateCommand,
      bootstrap.createRoomBlockedDateCommandHandler,
    );
    CommandBus.register(
      DeleteRoomBlockedDateCommand,
      bootstrap.deleteRoomBlockedDateCommandHandler,
    );
    CommandBus.register(
      CreateRoomRateOverrideCommand,
      bootstrap.createRoomRateOverrideCommandHandler,
    );
    CommandBus.register(
      DeleteRoomRateOverrideCommand,
      bootstrap.deleteRoomRateOverrideCommandHandler,
    );

    QueryBus.register(FindRoomQuery, bootstrap.findRoomQueryHandler);
    QueryBus.register(ListRoomsQuery, bootstrap.listRoomsQueryHandler);
    QueryBus.register(ListRoomTypesQuery, bootstrap.listRoomTypesQueryHandler);
    QueryBus.register(
      ListRoomTypeOptionsQuery,
      bootstrap.listRoomTypeOptionsQueryHandler,
    );
    QueryBus.register(
      ListRoomBlockedDatesQuery,
      bootstrap.listRoomBlockedDatesQueryHandler,
    );
    QueryBus.register(
      ListRoomRateOverridesQuery,
      bootstrap.listRoomRateOverridesQueryHandler,
    );
    QueryBus.register(
      GetRoomPricingPreviewQuery,
      bootstrap.getRoomPricingPreviewQueryHandler,
    );
  }
}
