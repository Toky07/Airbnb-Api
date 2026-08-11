import { Module, OnModuleInit } from '@nestjs/common';
import { UserModule } from '@src/modules/user/user.module';
import { PropertiesModule } from '@src/modules/properties/properties.module';
import { RoomsModule } from '@src/modules/rooms/room.module';
import { AmenityModule } from '@src/modules/amenity/amenity.module';
import { PropertyMediaPresenter } from '@src/modules/properties/contracts';
import { CommandBus } from '@src/shared/useCase/bus/bus';
import { QueryBus } from '@src/shared/useCase/bus/query-bus';
import { HostProfileController } from './interfaces/http/host-profile.controller';
import { HostPropertiesController } from './interfaces/http/host-properties.controller';
import { HostRoomsController } from './interfaces/http/host-rooms.controller';
import { HostReservationsController } from './interfaces/http/host-reservations.controller';
import { ResolveHostUserService } from './applications/services/resolve-host-user.service';
import { ResolveHostPropertyService } from './applications/services/resolve-host-property.service';
import { HostBootstrap } from './host.bootstrap';
import { CreateHostPropertyCommand } from './applications/useCase/commands/CreateHostPropertyCommand';
import { UpdateHostPropertyCommand } from './applications/useCase/commands/UpdateHostPropertyCommand';
import { CreateHostRoomCommand } from './applications/useCase/commands/CreateHostRoomCommand';
import { UpdateHostRoomCommand } from './applications/useCase/commands/UpdateHostRoomCommand';
import { DeleteHostRoomCommand } from './applications/useCase/commands/DeleteHostRoomCommand';
import { SyncHostPropertyAmenitiesCommand } from './applications/useCase/commands/SyncHostPropertyAmenitiesCommand';
import { SyncHostRoomAmenitiesCommand } from './applications/useCase/commands/SyncHostRoomAmenitiesCommand';
import { GetHostProfileQuery } from './applications/useCase/queries/GetHostProfileQuery';
import { ListHostPropertiesQuery } from './applications/useCase/queries/ListHostPropertiesQuery';
import { GetHostPropertyQuery } from './applications/useCase/queries/GetHostPropertyQuery';
import { ListHostRoomsQuery } from './applications/useCase/queries/ListHostRoomsQuery';
import { ListHostAmenityOptionsQuery } from './applications/useCase/queries/ListHostAmenityOptionsQuery';
import { GetHostPropertyAmenitiesQuery } from './applications/useCase/queries/GetHostPropertyAmenitiesQuery';
import { GetHostRoomAmenitiesQuery } from './applications/useCase/queries/GetHostRoomAmenitiesQuery';
import { CreateHostRoomBlockedDateCommand } from './applications/useCase/commands/CreateHostRoomBlockedDateCommand';
import { DeleteHostRoomBlockedDateCommand } from './applications/useCase/commands/DeleteHostRoomBlockedDateCommand';
import { ListHostRoomBlockedDatesQuery } from './applications/useCase/queries/ListHostRoomBlockedDatesQuery';
import { CreateHostRoomRateOverrideCommand } from './applications/useCase/commands/CreateHostRoomRateOverrideCommand';
import { DeleteHostRoomRateOverrideCommand } from './applications/useCase/commands/DeleteHostRoomRateOverrideCommand';
import { ListHostRoomRateOverridesQuery } from './applications/useCase/queries/ListHostRoomRateOverridesQuery';

@Module({
  imports: [UserModule, PropertiesModule, RoomsModule, AmenityModule],
  controllers: [
    HostProfileController,
    HostPropertiesController,
    HostRoomsController,
    HostReservationsController,
  ],

  providers: [ResolveHostUserService, ResolveHostPropertyService],
})
export class HostModule implements OnModuleInit {
  constructor(
    private readonly resolveHostUser: ResolveHostUserService,
    private readonly resolveHostProperty: ResolveHostPropertyService,
    private readonly propertyMediaPresenter: PropertyMediaPresenter,
  ) {}

  onModuleInit() {
    const bootstrap = HostBootstrap.create({
      resolveHostUser: this.resolveHostUser,
      resolveHostProperty: this.resolveHostProperty,
      propertyMediaPresenter: this.propertyMediaPresenter,
    });

    CommandBus.register(
      CreateHostPropertyCommand,
      bootstrap.createHostPropertyCommandHandler,
    );
    CommandBus.register(
      UpdateHostPropertyCommand,
      bootstrap.updateHostPropertyCommandHandler,
    );
    CommandBus.register(
      CreateHostRoomCommand,
      bootstrap.createHostRoomCommandHandler,
    );
    CommandBus.register(
      UpdateHostRoomCommand,
      bootstrap.updateHostRoomCommandHandler,
    );
    CommandBus.register(
      DeleteHostRoomCommand,
      bootstrap.deleteHostRoomCommandHandler,
    );
    CommandBus.register(
      SyncHostPropertyAmenitiesCommand,
      bootstrap.syncHostPropertyAmenitiesCommandHandler,
    );
    CommandBus.register(
      SyncHostRoomAmenitiesCommand,
      bootstrap.syncHostRoomAmenitiesCommandHandler,
    );
    CommandBus.register(
      CreateHostRoomBlockedDateCommand,
      bootstrap.createHostRoomBlockedDateCommandHandler,
    );
    CommandBus.register(
      DeleteHostRoomBlockedDateCommand,
      bootstrap.deleteHostRoomBlockedDateCommandHandler,
    );
    CommandBus.register(
      CreateHostRoomRateOverrideCommand,
      bootstrap.createHostRoomRateOverrideCommandHandler,
    );
    CommandBus.register(
      DeleteHostRoomRateOverrideCommand,
      bootstrap.deleteHostRoomRateOverrideCommandHandler,
    );

    QueryBus.register(
      GetHostProfileQuery,
      bootstrap.getHostProfileQueryHandler,
    );
    QueryBus.register(
      ListHostPropertiesQuery,
      bootstrap.listHostPropertiesQueryHandler,
    );
    QueryBus.register(
      GetHostPropertyQuery,
      bootstrap.getHostPropertyQueryHandler,
    );
    QueryBus.register(ListHostRoomsQuery, bootstrap.listHostRoomsQueryHandler);
    QueryBus.register(
      ListHostAmenityOptionsQuery,
      bootstrap.listHostAmenityOptionsQueryHandler,
    );
    QueryBus.register(
      GetHostPropertyAmenitiesQuery,
      bootstrap.getHostPropertyAmenitiesQueryHandler,
    );
    QueryBus.register(
      GetHostRoomAmenitiesQuery,
      bootstrap.getHostRoomAmenitiesQueryHandler,
    );
    QueryBus.register(
      ListHostRoomBlockedDatesQuery,
      bootstrap.listHostRoomBlockedDatesQueryHandler,
    );
    QueryBus.register(
      ListHostRoomRateOverridesQuery,
      bootstrap.listHostRoomRateOverridesQueryHandler,
    );
  }
}
