import { Inject, Module, OnModuleInit } from '@nestjs/common';
import { AuthModule } from '@src/modules/authentication/auth.module';
import { ROLE_REPOSITORY } from '@src/modules/authentication/contracts';
import type { IRoleRepository } from '@src/modules/authentication/contracts';
import { PropertiesModule } from '@src/modules/properties/properties.module';
import { PROPERTY_REPOSITORY } from '@src/modules/properties/contracts';
import type { IPropertyRepository } from '@src/modules/properties/contracts';
import { RoomsModule } from '@src/modules/rooms/room.module';
import { UserModule } from '@src/modules/user/user.module';
import { MediaModule } from '@src/modules/media/media.module';
import { CommandBus } from '@src/shared/useCase/bus/bus';
import { ImportController } from './interfaces/http/import.controller';
import { ImportBatchContextService } from './applications/services/import-batch-context.service';
import { ImportBootstrap } from './import.bootstrap';
import { ImportDataCommand } from './applications/useCase/commands/ImportDataCommand';

@Module({
  imports: [AuthModule, MediaModule, UserModule, PropertiesModule, RoomsModule],
  controllers: [ImportController],
  providers: [ImportBatchContextService],
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
