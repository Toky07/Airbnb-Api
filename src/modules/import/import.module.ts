import { Inject, Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../authentication/auth.module';
import { Role } from '../authentication/infrastructure/entity/role.entity';
import { PermissionEntity } from '../authentication/infrastructure/entity/permission.entity';
import { ROLE_REPOSITORY } from '../authentication/domain/repositories/role.repository';
import type { IRoleRepository } from '../authentication/domain/repositories/role.repository';
import { PropertyEntity } from '../properties/infrastructure/entities/property-entity.entity';
import { PropertyTypeEntity } from '../properties/infrastructure/entities/property-type.entity';
import { PROPERTY_REPOSITORY } from '../properties/infrastructure/repositories/property.repository';
import { PropertyRepository } from '../properties/infrastructure/repositories/property.repository';
import type { IPropertyRepository } from '../properties/domain/repositories/property.repository';
import { PROPERTY_TYPE_REPOSITORY } from '../properties/domain/repositories/property-type.repository';
import { PropertyTypeRepository } from '../properties/infrastructure/repositories/property-type.repository';
import { PropertyMediaPresenter } from '../properties/applications/presenters/property-media.presenter';
import { RoomTypeEntity } from '../rooms/infrastructure/entities/room-type.entity';
import { ROOM_TYPE_REPOSITORY } from '../rooms/domain/repositories/room-type.repository';
import { RoomTypeRepository } from '../rooms/infrastructure/repositories/room-type.repository';
import { UserModule } from '../user/user.module';
import { MediaModule } from '../media/media.module';
import { CommandBus } from '../../shared/useCase/bus/bus';
import { ImportController } from './interfaces/http/import.controller';
import { ImportBatchContextService } from './applications/services/import-batch-context.service';
import { ImportBootstrap } from './import.bootstrap';
import { ImportDataCommand } from './applications/useCase/commands/ImportDataCommand';

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
    PropertyMediaPresenter,
    PropertyRepository,
    { provide: PROPERTY_REPOSITORY, useClass: PropertyRepository },
    PropertyTypeRepository,
    { provide: PROPERTY_TYPE_REPOSITORY, useClass: PropertyTypeRepository },
    RoomTypeRepository,
    { provide: ROOM_TYPE_REPOSITORY, useClass: RoomTypeRepository },
  ],
})
export class ImportModule implements OnModuleInit {
  constructor(
    private readonly importBatchContext: ImportBatchContextService,
    @Inject(PROPERTY_REPOSITORY)
    private readonly propertyRepository: IPropertyRepository,
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
  ) {}

  onModuleInit() {
    const bootstrap = ImportBootstrap.create({
      importBatchContext: this.importBatchContext,
      propertyRepository: this.propertyRepository,
      roleRepository: this.roleRepository,
    });

    CommandBus.register(ImportDataCommand, bootstrap.importDataCommandHandler);
  }
}
