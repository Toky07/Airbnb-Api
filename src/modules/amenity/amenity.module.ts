import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertiesModule } from '../properties/properties.module';
import { RoomsModule } from '../rooms/room.module';
import { AMENITY_REPOSITORY } from './domain/repositories/amenity.repository';
import { PROPERTY_AMENITY_REPOSITORY } from './domain/repositories/property-amenity.repository';
import { ROOM_AMENITY_REPOSITORY } from './domain/repositories/room-amenity.repository';
import { ResolveAmenitiesService } from './applications/services/resolve-amenities.service';
import { CreateAmenityUseCase } from './applications/useCase/create-amenity.usecase';
import { DeleteAmenityUseCase } from './applications/useCase/delete-amenity.usecase';
import { ListAmenitiesUseCase } from './applications/useCase/list-amenities.usecase';
import { ListAmenityOptionsUseCase } from './applications/useCase/list-amenity-options.usecase';
import { ListPropertyAmenitiesUseCase } from './applications/useCase/list-property-amenities.usecase';
import { ListRoomAmenitiesUseCase } from './applications/useCase/list-room-amenities.usecase';
import { SyncPropertyAmenitiesUseCase } from './applications/useCase/sync-property-amenities.usecase';
import { SyncRoomAmenitiesUseCase } from './applications/useCase/sync-room-amenities.usecase';
import { UpdateAmenityUseCase } from './applications/useCase/update-amenity.usecase';
import { AmenityOrmEntity } from './infrastructure/entities/amenity.orm-entity';
import { PropertyAmenityOrmEntity } from './infrastructure/entities/property-amenity.orm-entity';
import { RoomAmenityOrmEntity } from './infrastructure/entities/room-amenity.orm-entity';
import { AmenityRepository } from './infrastructure/repositories/amenity.repository';
import { PropertyAmenityRepository } from './infrastructure/repositories/property-amenity.repository';
import { RoomAmenityRepository } from './infrastructure/repositories/room-amenity.repository';
import { AmenitiesSeedService } from './infrastructure/seed/amenities.seed';
import { AmenityController } from './interfaces/http/amenity.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AmenityOrmEntity,
      PropertyAmenityOrmEntity,
      RoomAmenityOrmEntity,
    ]),
    PropertiesModule,
    forwardRef(() => RoomsModule),
  ],
  controllers: [AmenityController],
  providers: [
    ResolveAmenitiesService,
    CreateAmenityUseCase,
    ListAmenitiesUseCase,
    ListAmenityOptionsUseCase,
    UpdateAmenityUseCase,
    DeleteAmenityUseCase,
    ListPropertyAmenitiesUseCase,
    SyncPropertyAmenitiesUseCase,
    ListRoomAmenitiesUseCase,
    SyncRoomAmenitiesUseCase,
    AmenitiesSeedService,
    AmenityRepository,
    PropertyAmenityRepository,
    RoomAmenityRepository,
    {
      provide: AMENITY_REPOSITORY,
      useClass: AmenityRepository,
    },
    {
      provide: PROPERTY_AMENITY_REPOSITORY,
      useClass: PropertyAmenityRepository,
    },
    {
      provide: ROOM_AMENITY_REPOSITORY,
      useClass: RoomAmenityRepository,
    },
  ],
  exports: [
    AMENITY_REPOSITORY,
    PROPERTY_AMENITY_REPOSITORY,
    ROOM_AMENITY_REPOSITORY,
    ListAmenityOptionsUseCase,
    ListAmenitiesUseCase,
    ListPropertyAmenitiesUseCase,
    ListRoomAmenitiesUseCase,
    SyncPropertyAmenitiesUseCase,
    SyncRoomAmenitiesUseCase,
    CreateAmenityUseCase,
    UpdateAmenityUseCase,
    DeleteAmenityUseCase,
  ],
})
export class AmenityModule {}
