import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { PropertiesModule } from '../properties/properties.module';
import { RoomsModule } from '../rooms/room.module';
import { AmenityModule } from '../amenity/amenity.module';
import { HostController } from './interfaces/http/host.controller';
import { ResolveHostUserService } from './applications/services/resolve-host-user.service';
import { ResolveHostPropertyService } from './applications/services/resolve-host-property.service';
import { GetHostProfileUseCase } from './applications/useCase/get-host-profile.usecase';
import {
  CreateHostPropertyUseCase,
  GetHostPropertyUseCase,
  ListHostPropertiesUseCase,
  UpdateHostPropertyUseCase,
} from './applications/useCase/host-property.usecase';
import {
  CreateHostRoomUseCase,
  DeleteHostRoomUseCase,
  ListHostRoomsUseCase,
  UpdateHostRoomUseCase,
} from './applications/useCase/host-rooms.usecase';
import {
  HostGetPropertyAmenitiesUseCase,
  HostGetRoomAmenitiesUseCase,
  HostListAmenityOptionsUseCase,
  HostSyncPropertyAmenitiesUseCase,
  HostSyncRoomAmenitiesUseCase,
} from './applications/useCase/host-amenity.usecase';

@Module({
  imports: [UserModule, PropertiesModule, RoomsModule, AmenityModule],
  controllers: [HostController],
  providers: [
    ResolveHostUserService,
    ResolveHostPropertyService,
    GetHostProfileUseCase,
    ListHostPropertiesUseCase,
    GetHostPropertyUseCase,
    CreateHostPropertyUseCase,
    UpdateHostPropertyUseCase,
    ListHostRoomsUseCase,
    CreateHostRoomUseCase,
    UpdateHostRoomUseCase,
    DeleteHostRoomUseCase,
    HostListAmenityOptionsUseCase,
    HostGetPropertyAmenitiesUseCase,
    HostSyncPropertyAmenitiesUseCase,
    HostGetRoomAmenitiesUseCase,
    HostSyncRoomAmenitiesUseCase,
  ],
})
export class HostModule {}
