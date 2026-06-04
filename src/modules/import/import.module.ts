import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertyEntity } from '../properties/infrastructure/entities/property-entity.entity';
import { PropertyTypeEntity } from '../properties/infrastructure/entities/property-type.entity';
import { CreatePropertyUseCase } from '../properties/applications/useCase/createProperty.usecase';
import { CreatePropertyTypeUseCase } from '../properties/applications/useCase/create-property-type.usecase';
import { PROPERTY_REPOSITORY } from '../properties/infrastructure/repositories/property.repository';
import { PropertyRepository } from '../properties/infrastructure/repositories/property.repository';
import { PROPERTY_TYPE_REPOSITORY } from '../properties/domain/repositories/property-type.repository';
import { PropertyTypeRepository } from '../properties/infrastructure/repositories/property-type.repository';
import { PropertyMediaPresenter } from '../properties/applications/presenters/property-media.presenter';
import { RoomEntity } from '../rooms/infrastructure/entities/room.entity';
import { RoomTypeEntity } from '../rooms/infrastructure/entities/room-type.entity';
import { CreateRoomUseCase } from '../rooms/applications/useCase/createRoom.usecase';
import { CreateRoomTypeUseCase } from '../rooms/applications/useCase/create-room-type.usecase';
import { ROOM_REPOSITORY } from '../rooms/domain/repositories/room.repository';
import { RoomRepository } from '../rooms/infrastructure/repositories/room.repository';
import { ROOM_TYPE_REPOSITORY } from '../rooms/domain/repositories/room-type.repository';
import { RoomTypeRepository } from '../rooms/infrastructure/repositories/room-type.repository';
import { RoomMediaPresenter } from '../rooms/applications/presenters/room-media.presenter';
import { UserModule } from '../user/user.module';
import { MediaModule } from '../media/media.module';
import { ImportController } from './interfaces/http/import.controller';
import { ImportDataUseCase } from './applications/useCase/importData.usecase';

@Module({
  imports: [
    MediaModule,
    UserModule,
    TypeOrmModule.forFeature([
      PropertyEntity,
      PropertyTypeEntity,
      RoomEntity,
      RoomTypeEntity,
    ]),
  ],
  controllers: [ImportController],
  providers: [
    ImportDataUseCase,
    CreatePropertyUseCase,
    CreatePropertyTypeUseCase,
    PropertyMediaPresenter,
    CreateRoomUseCase,
    CreateRoomTypeUseCase,
    RoomMediaPresenter,
    PropertyRepository,
    { provide: PROPERTY_REPOSITORY, useClass: PropertyRepository },
    PropertyTypeRepository,
    { provide: PROPERTY_TYPE_REPOSITORY, useClass: PropertyTypeRepository },
    RoomRepository,
    { provide: ROOM_REPOSITORY, useClass: RoomRepository },
    RoomTypeRepository,
    { provide: ROOM_TYPE_REPOSITORY, useClass: RoomTypeRepository },
  ],
})
export class ImportModule {}
