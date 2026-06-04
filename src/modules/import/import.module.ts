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
import { UserEntity } from '../user/infrastructure/entities/user.entity';
import { CreateUserUseCase } from '../user/application/useCase/createuser.usecase';
import { SaveUserAvatarUseCase } from '../user/application/useCase/saveUserAvatar.usecase';
import { USER_REPOSITORY } from '../user/infrastructure/repositories/user.repository';
import { UserRepository } from '../user/infrastructure/repositories/user.repository';
import { MediaModule } from '../media/media.module';
import { ImportController } from './interfaces/http/import.controller';
import { ImportDataUseCase } from './applications/useCase/importData.usecase';

@Module({
  imports: [
    MediaModule,
    TypeOrmModule.forFeature([UserEntity, PropertyEntity, RoomEntity]),
  ],
  controllers: [ImportController],
  providers: [
    ImportDataUseCase,
    CreateUserUseCase,
    SaveUserAvatarUseCase,
    CreatePropertyUseCase,
    PropertyMediaPresenter,
    CreateRoomUseCase,
    RoomMediaPresenter,
    UserRepository,
    { provide: USER_REPOSITORY, useClass: UserRepository },
    PropertyRepository,
    { provide: PROPERTY_REPOSITORY, useClass: PropertyRepository },
    RoomRepository,
    { provide: ROOM_REPOSITORY, useClass: RoomRepository },
  ],
})
export class ImportModule {}
