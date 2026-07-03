import type { IAmenityRepository } from './domain/repositories/amenity.repository';
import type { IPropertyAmenityRepository } from './domain/repositories/property-amenity.repository';
import type { IRoomAmenityRepository } from './domain/repositories/room-amenity.repository';
import type { IPropertyRepository } from '../properties/domain/repositories/property.repository';
import type { IRoomRepository } from '../rooms/domain/repositories/room.repository';
import { ResolveAmenitiesService } from './applications/services/resolve-amenities.service';
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
        new SyncPropertyAmenitiesCommandHandler(
          deps.propertyRepository,
          deps.propertyAmenityRepository,
          resolveAmenitiesService,
        ),
      syncRoomAmenitiesCommandHandler: new SyncRoomAmenitiesCommandHandler(
        deps.roomRepository,
        deps.roomAmenityRepository,
        resolveAmenitiesService,
      ),
      listAmenitiesQueryHandler: new ListAmenitiesQueryHandler(
        deps.amenityRepository,
      ),
      listAmenityOptionsQueryHandler: new ListAmenityOptionsQueryHandler(
        deps.amenityRepository,
      ),
      listPropertyAmenitiesQueryHandler: new ListPropertyAmenitiesQueryHandler(
        deps.propertyRepository,
        deps.propertyAmenityRepository,
        deps.amenityRepository,
      ),
      listRoomAmenitiesQueryHandler: new ListRoomAmenitiesQueryHandler(
        deps.roomRepository,
        deps.roomAmenityRepository,
        deps.amenityRepository,
      ),
    };
  }
}
