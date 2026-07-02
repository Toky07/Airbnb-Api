import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../authentication/auth.module';
import { Role } from '../authentication/infrastructure/entity/role.entity';
import { PermissionEntity } from '../authentication/infrastructure/entity/permission.entity';
import { PropertyEntity } from '../properties/infrastructure/entities/property-entity.entity';
import { PropertyTypeEntity } from '../properties/infrastructure/entities/property-type.entity';
import { PROPERTY_REPOSITORY } from '../properties/infrastructure/repositories/property.repository';
import { PropertyRepository } from '../properties/infrastructure/repositories/property.repository';
import { PROPERTY_TYPE_REPOSITORY } from '../properties/domain/repositories/property-type.repository';
import { PropertyTypeRepository } from '../properties/infrastructure/repositories/property-type.repository';
import { PropertyMediaPresenter } from '../properties/applications/presenters/property-media.presenter';
import { RoomTypeEntity } from '../rooms/infrastructure/entities/room-type.entity';
import { ROOM_TYPE_REPOSITORY } from '../rooms/domain/repositories/room-type.repository';
import { RoomTypeRepository } from '../rooms/infrastructure/repositories/room-type.repository';
import { UserModule } from '../user/user.module';
import { MediaModule } from '../media/media.module';
import { ImportController } from './interfaces/http/import.controller';
import { ImportBatchContextService } from './applications/services/import-batch-context.service';
import { ImportDataUseCase } from './applications/useCase/import-data.usecase';
import { ImportUsersUseCase } from './applications/useCase/import-users.usecase';
import { ImportPropertiesUseCase } from './applications/useCase/import-properties.usecase';
import { ImportRoomsUseCase } from './applications/useCase/import-rooms.usecase';
import { ImportPropertyTypesUseCase } from './applications/useCase/import-property-types.usecase';
import { ImportRoomTypesUseCase } from './applications/useCase/import-room-types.usecase';
import { ImportRolesUseCase } from './applications/useCase/import-roles.usecase';

@Module({
  imports: [
    AuthModule,
    MediaModule,
    UserModule,
    TypeOrmModule.forFeature([
      Role,
      PermissionEntity,
      PropertyEntity,
      PropertyTypeEntity,
      RoomTypeEntity,
    ]),
  ],
  controllers: [ImportController],
  providers: [
    ImportBatchContextService,
    ImportDataUseCase,
    ImportUsersUseCase,
    ImportPropertiesUseCase,
    ImportRoomsUseCase,
    ImportPropertyTypesUseCase,
    ImportRoomTypesUseCase,
    ImportRolesUseCase,
    PropertyMediaPresenter,
    PropertyRepository,
    { provide: PROPERTY_REPOSITORY, useClass: PropertyRepository },
    PropertyTypeRepository,
    { provide: PROPERTY_TYPE_REPOSITORY, useClass: PropertyTypeRepository },
    RoomTypeRepository,
    { provide: ROOM_TYPE_REPOSITORY, useClass: RoomTypeRepository },
  ],
})
export class ImportModule {}
