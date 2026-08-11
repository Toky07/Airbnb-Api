import type { IPropertyRepository } from '@src/modules/properties/contracts';
import type { IRoleRepository } from '@src/modules/authentication/contracts';
import { ImportBatchContextService } from './applications/services/import-batch-context.service';
import { ImportDataCommandHandler } from './applications/useCase/handlers/ImportDataCommandHandler';
import { ImportUsersHandler } from './applications/useCase/handlers/ImportUsersHandler';
import { ImportPropertiesHandler } from './applications/useCase/handlers/ImportPropertiesHandler';
import { ImportRoomsHandler } from './applications/useCase/handlers/ImportRoomsHandler';
import { ImportPropertyTypesHandler } from './applications/useCase/handlers/ImportPropertyTypesHandler';
import { ImportRoomTypesHandler } from './applications/useCase/handlers/ImportRoomTypesHandler';
import { ImportRolesHandler } from './applications/useCase/handlers/ImportRolesHandler';

export class ImportBootstrap {
  static create(deps: {
    importBatchContext: ImportBatchContextService;
    propertyRepository: IPropertyRepository;
    roleRepository: IRoleRepository;
  }) {
    const importUsers = new ImportUsersHandler();
    const importProperties = new ImportPropertiesHandler();
    const importRooms = new ImportRoomsHandler(deps.propertyRepository);
    const importPropertyTypes = new ImportPropertyTypesHandler();
    const importRoomTypes = new ImportRoomTypesHandler();
    const importRoles = new ImportRolesHandler(deps.roleRepository);

    return {
      importDataCommandHandler: new ImportDataCommandHandler(
        deps.importBatchContext,
        importUsers,
        importProperties,
        importRooms,
        importPropertyTypes,
        importRoomTypes,
        importRoles,
      ),
    };
  }
}
