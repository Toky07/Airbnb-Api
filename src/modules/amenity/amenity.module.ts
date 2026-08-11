import { Inject, Module, OnModuleInit, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertiesModule } from '../properties/properties.module';
import { RoomsModule } from '../rooms/room.module';
import { AMENITY_REPOSITORY } from './domain/repositories/amenity.repository';
import type { IAmenityRepository } from './domain/repositories/amenity.repository';
import { PROPERTY_AMENITY_REPOSITORY } from './domain/repositories/property-amenity.repository';
import type { IPropertyAmenityRepository } from './domain/repositories/property-amenity.repository';
import { ROOM_AMENITY_REPOSITORY } from './domain/repositories/room-amenity.repository';
import type { IRoomAmenityRepository } from './domain/repositories/room-amenity.repository';
import { AmenityOrmEntity } from './infrastructure/entities/amenity.orm-entity';
import { PropertyAmenityOrmEntity } from './infrastructure/entities/property-amenity.orm-entity';
import { RoomAmenityOrmEntity } from './infrastructure/entities/room-amenity.orm-entity';
import { AmenityRepository } from './infrastructure/repositories/amenity.repository';
import { PropertyAmenityRepository } from './infrastructure/repositories/property-amenity.repository';
import { RoomAmenityRepository } from './infrastructure/repositories/room-amenity.repository';
import { AmenitiesSeedService } from './infrastructure/seed/amenities.seed';
import { AmenityController } from './interfaces/http/amenity.controller';
import { PROPERTY_REPOSITORY } from '../properties/contracts';
import type { IPropertyRepository } from '../properties/contracts';
import { ROOM_REPOSITORY } from '../rooms/contracts';
import type { IRoomRepository } from '../rooms/contracts';
import { AmenityBootstrap } from './amenity.bootstrap';
import { CommandBus } from '../../shared/useCase/bus/bus';
import { QueryBus } from '../../shared/useCase/bus/query-bus';
import { CreateAmenityCommand } from './applications/useCase/commands/CreateAmenityCommand';
import { UpdateAmenityCommand } from './applications/useCase/commands/UpdateAmenityCommand';
import { DeleteAmenityCommand } from './applications/useCase/commands/DeleteAmenityCommand';
import { SyncPropertyAmenitiesCommand } from './applications/useCase/commands/SyncPropertyAmenitiesCommand';
import { SyncRoomAmenitiesCommand } from './applications/useCase/commands/SyncRoomAmenitiesCommand';
import { ListAmenitiesQuery } from './applications/useCase/queries/ListAmenitiesQuery';
import { ListAmenityOptionsQuery } from './applications/useCase/queries/ListAmenityOptionsQuery';
import { ListPropertyAmenitiesQuery } from './applications/useCase/queries/ListPropertyAmenitiesQuery';
import { ListRoomAmenitiesQuery } from './applications/useCase/queries/ListRoomAmenitiesQuery';

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
  ],
})
export class AmenityModule implements OnModuleInit {
  constructor(
    @Inject(AMENITY_REPOSITORY)
    private readonly amenityRepository: IAmenityRepository,
    @Inject(PROPERTY_REPOSITORY)
    private readonly propertyRepository: IPropertyRepository,
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
    @Inject(PROPERTY_AMENITY_REPOSITORY)
    private readonly propertyAmenityRepository: IPropertyAmenityRepository,
    @Inject(ROOM_AMENITY_REPOSITORY)
    private readonly roomAmenityRepository: IRoomAmenityRepository,
  ) {}

  onModuleInit() {
    const bootstrap = AmenityBootstrap.create({
      amenityRepository: this.amenityRepository,
      propertyRepository: this.propertyRepository,
      roomRepository: this.roomRepository,
      propertyAmenityRepository: this.propertyAmenityRepository,
      roomAmenityRepository: this.roomAmenityRepository,
    });

    CommandBus.register(
      CreateAmenityCommand,
      bootstrap.createAmenityCommandHandler,
    );
    CommandBus.register(
      UpdateAmenityCommand,
      bootstrap.updateAmenityCommandHandler,
    );
    CommandBus.register(
      DeleteAmenityCommand,
      bootstrap.deleteAmenityCommandHandler,
    );
    CommandBus.register(
      SyncPropertyAmenitiesCommand,
      bootstrap.syncPropertyAmenitiesCommandHandler,
    );
    CommandBus.register(
      SyncRoomAmenitiesCommand,
      bootstrap.syncRoomAmenitiesCommandHandler,
    );

    QueryBus.register(ListAmenitiesQuery, bootstrap.listAmenitiesQueryHandler);
    QueryBus.register(
      ListAmenityOptionsQuery,
      bootstrap.listAmenityOptionsQueryHandler,
    );
    QueryBus.register(
      ListPropertyAmenitiesQuery,
      bootstrap.listPropertyAmenitiesQueryHandler,
    );
    QueryBus.register(
      ListRoomAmenitiesQuery,
      bootstrap.listRoomAmenitiesQueryHandler,
    );
  }
}
