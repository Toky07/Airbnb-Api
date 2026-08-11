import { PropertyMediaPresenter } from '@src/modules/properties/contracts';
import { AssertHostRoomOwnershipService } from './applications/services/assert-host-room-ownership.service';
import { ResolveHostUserService } from './applications/services/resolve-host-user.service';
import { ResolveHostPropertyService } from './applications/services/resolve-host-property.service';
import { CreateHostPropertyCommandHandler } from './applications/useCase/handlers/CreateHostPropertyCommandHandler';
import { UpdateHostPropertyCommandHandler } from './applications/useCase/handlers/UpdateHostPropertyCommandHandler';
import { CreateHostRoomCommandHandler } from './applications/useCase/handlers/CreateHostRoomCommandHandler';
import { UpdateHostRoomCommandHandler } from './applications/useCase/handlers/UpdateHostRoomCommandHandler';
import { DeleteHostRoomCommandHandler } from './applications/useCase/handlers/DeleteHostRoomCommandHandler';
import { SyncHostPropertyAmenitiesCommandHandler } from './applications/useCase/handlers/SyncHostPropertyAmenitiesCommandHandler';
import { SyncHostRoomAmenitiesCommandHandler } from './applications/useCase/handlers/SyncHostRoomAmenitiesCommandHandler';
import { GetHostProfileQueryHandler } from './applications/useCase/handlers/GetHostProfileQueryHandler';
import { ListHostPropertiesQueryHandler } from './applications/useCase/handlers/ListHostPropertiesQueryHandler';
import { GetHostPropertyQueryHandler } from './applications/useCase/handlers/GetHostPropertyQueryHandler';
import { ListHostRoomsQueryHandler } from './applications/useCase/handlers/ListHostRoomsQueryHandler';
import { ListHostAmenityOptionsQueryHandler } from './applications/useCase/handlers/ListHostAmenityOptionsQueryHandler';
import { GetHostPropertyAmenitiesQueryHandler } from './applications/useCase/handlers/GetHostPropertyAmenitiesQueryHandler';
import { GetHostRoomAmenitiesQueryHandler } from './applications/useCase/handlers/GetHostRoomAmenitiesQueryHandler';
import { CreateHostRoomBlockedDateCommandHandler } from './applications/useCase/handlers/CreateHostRoomBlockedDateCommandHandler';
import { DeleteHostRoomBlockedDateCommandHandler } from './applications/useCase/handlers/DeleteHostRoomBlockedDateCommandHandler';
import { ListHostRoomBlockedDatesQueryHandler } from './applications/useCase/handlers/ListHostRoomBlockedDatesQueryHandler';
import { CreateHostRoomRateOverrideCommandHandler } from './applications/useCase/handlers/CreateHostRoomRateOverrideCommandHandler';
import { DeleteHostRoomRateOverrideCommandHandler } from './applications/useCase/handlers/DeleteHostRoomRateOverrideCommandHandler';
import { ListHostRoomRateOverridesQueryHandler } from './applications/useCase/handlers/ListHostRoomRateOverridesQueryHandler';

export class HostBootstrap {
  static create(deps: {
    resolveHostUser: ResolveHostUserService;
    resolveHostProperty: ResolveHostPropertyService;
    propertyMediaPresenter: PropertyMediaPresenter;
  }) {
    const assertHostRoomOwnership = new AssertHostRoomOwnershipService(
      deps.resolveHostProperty,
    );

    return {
      getHostProfileQueryHandler: new GetHostProfileQueryHandler(
        deps.resolveHostUser,
        deps.resolveHostProperty,
        deps.propertyMediaPresenter,
      ),
      listHostPropertiesQueryHandler: new ListHostPropertiesQueryHandler(
        deps.resolveHostProperty,
        deps.propertyMediaPresenter,
      ),
      getHostPropertyQueryHandler: new GetHostPropertyQueryHandler(
        deps.resolveHostProperty,
        deps.propertyMediaPresenter,
      ),
      createHostPropertyCommandHandler: new CreateHostPropertyCommandHandler(
        deps.resolveHostUser,
      ),
      updateHostPropertyCommandHandler: new UpdateHostPropertyCommandHandler(
        deps.resolveHostProperty,
        deps.resolveHostUser,
      ),
      listHostRoomsQueryHandler: new ListHostRoomsQueryHandler(
        deps.resolveHostProperty,
      ),
      createHostRoomCommandHandler: new CreateHostRoomCommandHandler(
        deps.resolveHostProperty,
      ),
      updateHostRoomCommandHandler: new UpdateHostRoomCommandHandler(
        deps.resolveHostProperty,
        assertHostRoomOwnership,
      ),
      deleteHostRoomCommandHandler: new DeleteHostRoomCommandHandler(
        assertHostRoomOwnership,
      ),
      listHostAmenityOptionsQueryHandler:
        new ListHostAmenityOptionsQueryHandler(),
      getHostPropertyAmenitiesQueryHandler:
        new GetHostPropertyAmenitiesQueryHandler(deps.resolveHostProperty),
      getHostRoomAmenitiesQueryHandler: new GetHostRoomAmenitiesQueryHandler(
        assertHostRoomOwnership,
      ),
      syncHostPropertyAmenitiesCommandHandler:
        new SyncHostPropertyAmenitiesCommandHandler(deps.resolveHostProperty),
      syncHostRoomAmenitiesCommandHandler:
        new SyncHostRoomAmenitiesCommandHandler(assertHostRoomOwnership),
      listHostRoomBlockedDatesQueryHandler:
        new ListHostRoomBlockedDatesQueryHandler(assertHostRoomOwnership),
      createHostRoomBlockedDateCommandHandler:
        new CreateHostRoomBlockedDateCommandHandler(assertHostRoomOwnership),
      deleteHostRoomBlockedDateCommandHandler:
        new DeleteHostRoomBlockedDateCommandHandler(assertHostRoomOwnership),
      listHostRoomRateOverridesQueryHandler:
        new ListHostRoomRateOverridesQueryHandler(assertHostRoomOwnership),
      createHostRoomRateOverrideCommandHandler:
        new CreateHostRoomRateOverrideCommandHandler(assertHostRoomOwnership),
      deleteHostRoomRateOverrideCommandHandler:
        new DeleteHostRoomRateOverrideCommandHandler(assertHostRoomOwnership),
    };
  }
}
