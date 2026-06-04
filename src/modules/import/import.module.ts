import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertyEntity } from '../properties/infrastructure/entities/property-entity.entity';
import { CreatePropertyUseCase } from '../properties/applications/useCase/createProperty.usecase';
import { PROPERTY_REPOSITORY } from '../properties/infrastructure/repositories/property.repository';
import { PropertyRepository } from '../properties/infrastructure/repositories/property.repository';
import { PropertyMediaPresenter } from '../properties/applications/presenters/property-media.presenter';
import { RoomEntity } from '../rooms/infrastructure/entities/room.entity';
import { CreateRoomUseCase } from '../rooms/applications/useCase/createRoom.usecase';
import { ROOM_REPOSITORY } from '../rooms/domain/repositories/room.repository';
import { RoomRepository } from '../rooms/infrastructure/repositories/room.repository';
import { RoomMediaPresenter } from '../rooms/applications/presenters/room-media.presenter';
import { UserModule } from '../user/user.module';
import { MediaModule } from '../media/media.module';
import { ImportController } from './interfaces/http/import.controller';
import { ImportDataUseCase } from './applications/useCase/importData.usecase';

@Module({
  imports: [
    MediaModule,
    UserModule,
    TypeOrmModule.forFeature([PropertyEntity, RoomEntity]),
  ],
  controllers: [ImportController],
  providers: [
    ImportDataUseCase,
    CreatePropertyUseCase,
    PropertyMediaPresenter,
    CreateRoomUseCase,
    RoomMediaPresenter,
    PropertyRepository,
    { provide: PROPERTY_REPOSITORY, useClass: PropertyRepository },
    RoomRepository,
    { provide: ROOM_REPOSITORY, useClass: RoomRepository },
  ],
})
export class ImportModule {}
