import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { PropertiesModule } from '../properties/properties.module';
import { RoomsModule } from '../rooms/room.module';
import { HostController } from './interfaces/http/host.controller';
import { ResolveHostUserService } from './application/services/resolve-host-user.service';
import { GetHostProfileUseCase } from './application/useCase/get-host-profile.usecase';
import {
  CreateHostPropertyUseCase,
  GetHostPropertyUseCase,
  UpdateHostPropertyUseCase,
} from './application/useCase/host-property.usecase';
import {
  CreateHostRoomUseCase,
  DeleteHostRoomUseCase,
  ListHostRoomsUseCase,
  UpdateHostRoomUseCase,
} from './application/useCase/host-rooms.usecase';

@Module({
  imports: [UserModule, PropertiesModule, RoomsModule],
  controllers: [HostController],
  providers: [
    ResolveHostUserService,
    GetHostProfileUseCase,
    GetHostPropertyUseCase,
    CreateHostPropertyUseCase,
    UpdateHostPropertyUseCase,
    ListHostRoomsUseCase,
    CreateHostRoomUseCase,
    UpdateHostRoomUseCase,
    DeleteHostRoomUseCase,
  ],
})
export class HostModule {}
