import type { IAmenityRepository } from './domain/repositories/amenity.repository';
import type { IPropertyAmenityRepository } from './domain/repositories/property-amenity.repository';
import type { IRoomAmenityRepository } from './domain/repositories/room-amenity.repository';
import type { IPropertyRepository } from '@src/modules/properties/contracts';
import type { IRoomRepository } from '@src/modules/rooms/contracts';
import { ResolveAmenitiesService } from './applications/services/resolve-amenities.service';
import { ListEntityAmenitiesService } from './applications/services/list-entity-amenities.service';
import { SyncEntityAmenitiesService } from './applications/services/sync-entity-amenities.service';
import { CreateAmenityCommandHandler } from './applications/useCase/handlers/CreateAmenityCommandHandler';
import { UpdateAmenityCommandHandler } from './applications/useCase/handlers/UpdateAmenityCommandHandler';
import { DeleteAmenityCommandHandler } from './applications/useCase/handlers/DeleteAmenityCommandHandler';
import { SyncPropertyAmenitiesCommandHandler } from './applications/useCase/handlers/SyncPropertyAmenitiesCommandHandler';
import { SyncRoomAmenitiesCommandHandler } from './applications/useCase/handlers/SyncRoomAmenitiesCommandHandler';
import { ListAmenitiesQueryHandler } from './applications/useCase/handlers/ListAmenitiesQueryHandler';
import { ListAmenityOptionsQueryHandler } from './applications/useCase/handlers/ListAmenityOptionsQueryHandler';
import { ListPropertyAmenitiesQueryHandler } from './applications/useCase/handlers/ListPropertyAmenitiesQueryHandler';
import { ListRoomAmenitiesQueryHandler } from './applications/useCase/handlers/ListRoomAmenitiesQueryHandler';

export class AmenityBootstrap {
  static create(deps: {
    amenityRepository: IAmenityRepository;
    propertyRepository: IPropertyRepository;
    roomRepository: IRoomRepository;
    propertyAmenityRepository: IPropertyAmenityRepository;
    roomAmenityRepository: IRoomAmenityRepository;
  }) {
    const resolveAmenitiesService = new ResolveAmenitiesService(
      deps.amenityRepository,
    );
    const syncEntityAmenitiesService = new SyncEntityAmenitiesService(
      deps.propertyRepository,
      deps.roomRepository,
      deps.propertyAmenityRepository,
      deps.roomAmenityRepository,
      resolveAmenitiesService,
    );
    const listEntityAmenitiesService = new ListEntityAmenitiesService(
      deps.propertyRepository,
      deps.roomRepository,
      deps.propertyAmenityRepository,
      deps.roomAmenityRepository,
      deps.amenityRepository,
    );

    return {
      createAmenityCommandHandler: new CreateAmenityCommandHandler(
        deps.amenityRepository,
      ),
      updateAmenityCommandHandler: new UpdateAmenityCommandHandler(
        deps.amenityRepository,
      ),
      deleteAmenityCommandHandler: new DeleteAmenityCommandHandler(
        deps.amenityRepository,
      ),
      syncPropertyAmenitiesCommandHandler:
        new SyncPropertyAmenitiesCommandHandler(syncEntityAmenitiesService),
      syncRoomAmenitiesCommandHandler: new SyncRoomAmenitiesCommandHandler(
        syncEntityAmenitiesService,
      ),
      listAmenitiesQueryHandler: new ListAmenitiesQueryHandler(
        deps.amenityRepository,
      ),
      listAmenityOptionsQueryHandler: new ListAmenityOptionsQueryHandler(
        deps.amenityRepository,
      ),
      listPropertyAmenitiesQueryHandler: new ListPropertyAmenitiesQueryHandler(
        listEntityAmenitiesService,
      ),
      listRoomAmenitiesQueryHandler: new ListRoomAmenitiesQueryHandler(
        listEntityAmenitiesService,
      ),
    };
  }
}
