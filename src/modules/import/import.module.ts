import { Inject, Module, OnModuleInit } from '@nestjs/common';
import { AuthModule } from '../authentication/auth.module';
import { ROLE_REPOSITORY } from '../authentication/contracts';
import type { IRoleRepository } from '../authentication/contracts';
import { PropertiesModule } from '../properties/properties.module';
import { PROPERTY_REPOSITORY } from '../properties/contracts';
import type { IPropertyRepository } from '../properties/contracts';
import { RoomsModule } from '../rooms/room.module';
import { UserModule } from '../user/user.module';
import { MediaModule } from '../media/media.module';
import { CommandBus } from '../../shared/useCase/bus/bus';
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
