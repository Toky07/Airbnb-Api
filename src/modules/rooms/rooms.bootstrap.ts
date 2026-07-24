import type { Repository } from 'typeorm';
import type { ReservationItemOrmEntity } from '../reservation/infrastructure/entities/reservation-item.orm-entity';
import type { IRoomRepository } from './domain/repositories/room.repository';
import type { IRoomTypeRepository } from './domain/repositories/room-type.repository';
import type { IRoomBlockedDateRepository } from './domain/repositories/room-blocked-date.repository';
import type { IRoomRateOverrideRepository } from './domain/repositories/room-rate-override.repository';
import { RoomDetailResolver } from './applications/services/room-detail.resolver';
import type { RoomMediaPresenter } from './applications/presenters/room-media.presenter';
import type { GenerateRoomSlugService } from './applications/services/generate-room-slug.service';
import { CreateRoomCommandHandler } from './applications/useCase/handlers/CreateRoomCommandHandler';
import { UpdateRoomCommandHandler } from './applications/useCase/handlers/UpdateRoomCommandHandler';
import { DeleteRoomCommandHandler } from './applications/useCase/handlers/DeleteRoomCommandHandler';
import { FindRoomQueryHandler } from './applications/useCase/handlers/FindRoomQueryHandler';
import { ListRoomsQueryHandler } from './applications/useCase/handlers/ListRoomsQueryHandler';
import { CreateRoomTypeCommandHandler } from './applications/useCase/handlers/CreateRoomTypeCommandHandler';
import { UpdateRoomTypeCommandHandler } from './applications/useCase/handlers/UpdateRoomTypeCommandHandler';
import { DeleteRoomTypeCommandHandler } from './applications/useCase/handlers/DeleteRoomTypeCommandHandler';
import { ListRoomTypesQueryHandler } from './applications/useCase/handlers/ListRoomTypesQueryHandler';
import { ListRoomTypeOptionsQueryHandler } from './applications/useCase/handlers/ListRoomTypeOptionsQueryHandler';
import { CreateRoomBlockedDateCommandHandler } from './applications/useCase/handlers/CreateRoomBlockedDateCommandHandler';
import { DeleteRoomBlockedDateCommandHandler } from './applications/useCase/handlers/DeleteRoomBlockedDateCommandHandler';
import { ListRoomBlockedDatesQueryHandler } from './applications/useCase/handlers/ListRoomBlockedDatesQueryHandler';
import { CreateRoomRateOverrideCommandHandler } from './applications/useCase/handlers/CreateRoomRateOverrideCommandHandler';
import { DeleteRoomRateOverrideCommandHandler } from './applications/useCase/handlers/DeleteRoomRateOverrideCommandHandler';
import { ListRoomRateOverridesQueryHandler } from './applications/useCase/handlers/ListRoomRateOverridesQueryHandler';
import { GetRoomPricingPreviewQueryHandler } from './applications/useCase/handlers/GetRoomPricingPreviewQueryHandler';
import type { RoomStayPricingService } from './applications/services/room-stay-pricing.service';
import type { ComputePricingBreakdownService } from '../../shared/pricing/compute-pricing-breakdown.service';

export class RoomsBootstrap {
  static create(deps: {
    roomRepository: IRoomRepository;
    roomTypeRepository: IRoomTypeRepository;
    roomBlockedDateRepository: IRoomBlockedDateRepository;
    roomRateOverrideRepository: IRoomRateOverrideRepository;
    roomMediaPresenter: RoomMediaPresenter;
    generateRoomSlug: GenerateRoomSlugService;
    roomStayPricing: RoomStayPricingService;
    reservationItemRepo: Repository<ReservationItemOrmEntity>;
    computePricingBreakdown: ComputePricingBreakdownService;
  }) {
    const roomDetailResolver = new RoomDetailResolver(
      deps.roomMediaPresenter,
      deps.reservationItemRepo,
      deps.roomBlockedDateRepository,
    );

    return {
      createRoomCommandHandler: new CreateRoomCommandHandler(
        deps.roomRepository,
        deps.roomMediaPresenter,
        deps.generateRoomSlug,
      ),
      updateRoomCommandHandler: new UpdateRoomCommandHandler(
        deps.roomRepository,
        deps.roomMediaPresenter,
        deps.generateRoomSlug,
      ),
      deleteRoomCommandHandler: new DeleteRoomCommandHandler(
        deps.roomRepository,
      ),
      findRoomQueryHandler: new FindRoomQueryHandler(
        deps.roomRepository,
        roomDetailResolver,
      ),
      listRoomsQueryHandler: new ListRoomsQueryHandler(
        deps.roomRepository,
        deps.roomMediaPresenter,
      ),
      createRoomTypeCommandHandler: new CreateRoomTypeCommandHandler(
        deps.roomTypeRepository,
      ),
      updateRoomTypeCommandHandler: new UpdateRoomTypeCommandHandler(
        deps.roomTypeRepository,
      ),
      deleteRoomTypeCommandHandler: new DeleteRoomTypeCommandHandler(
        deps.roomTypeRepository,
      ),
      listRoomTypesQueryHandler: new ListRoomTypesQueryHandler(
        deps.roomTypeRepository,
      ),
      listRoomTypeOptionsQueryHandler: new ListRoomTypeOptionsQueryHandler(
        deps.roomTypeRepository,
      ),
      createRoomBlockedDateCommandHandler:
        new CreateRoomBlockedDateCommandHandler(
          deps.roomBlockedDateRepository,
          deps.roomRepository,
        ),
      deleteRoomBlockedDateCommandHandler:
        new DeleteRoomBlockedDateCommandHandler(deps.roomBlockedDateRepository),
      listRoomBlockedDatesQueryHandler: new ListRoomBlockedDatesQueryHandler(
        deps.roomBlockedDateRepository,
      ),
      createRoomRateOverrideCommandHandler:
        new CreateRoomRateOverrideCommandHandler(
          deps.roomRateOverrideRepository,
          deps.roomRepository,
        ),
      deleteRoomRateOverrideCommandHandler:
        new DeleteRoomRateOverrideCommandHandler(deps.roomRateOverrideRepository),
      listRoomRateOverridesQueryHandler: new ListRoomRateOverridesQueryHandler(
        deps.roomRateOverrideRepository,
      ),
      getRoomPricingPreviewQueryHandler: new GetRoomPricingPreviewQueryHandler(
        deps.roomRepository,
        deps.roomStayPricing,
        deps.computePricingBreakdown,
      ),
    };
  }
}
