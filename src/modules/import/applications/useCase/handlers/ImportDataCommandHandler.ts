import type { ICommandHandler } from '@src/shared/useCase/bus/command-handler.interface';
import type {
  ImportBatchDto,
  ImportBatchResult,
} from '@src/modules/import/applications/dto/import-batch.dto';
import { ImportBatchContextService } from '@src/modules/import/applications/services/import-batch-context.service';
import { ImportPropertiesHandler } from './ImportPropertiesHandler';
import { ImportRolesHandler } from './ImportRolesHandler';
import { ImportRoomsHandler } from './ImportRoomsHandler';
import { ImportUsersHandler } from './ImportUsersHandler';
import { ImportPropertyTypesHandler } from './ImportPropertyTypesHandler';
import { ImportRoomTypesHandler } from './ImportRoomTypesHandler';
import type { ImportDataCommand } from '@src/modules/import/applications/useCase/commands/ImportDataCommand';

export class ImportDataCommandHandler implements ICommandHandler<
  ImportDataCommand,
  ImportBatchResult
> {
  constructor(
    private readonly importBatchContext: ImportBatchContextService,
    private readonly importUsers: ImportUsersHandler,
    private readonly importProperties: ImportPropertiesHandler,
    private readonly importRooms: ImportRoomsHandler,
    private readonly importPropertyTypes: ImportPropertyTypesHandler,
    private readonly importRoomTypes: ImportRoomTypesHandler,
    private readonly importRoles: ImportRolesHandler,
  ) {}

  async execute(command: ImportDataCommand): Promise<ImportBatchResult> {
    return this.importBatch(command.batch);
  }

  private async importBatch(batch: ImportBatchDto): Promise<ImportBatchResult> {
    const context = await this.importBatchContext.create();

    const users = await this.importUsers.execute(batch.users, context);
    const properties = await this.importProperties.execute(
      batch.properties,
      context,
    );
    const rooms = await this.importRooms.execute(batch.rooms, context);
    const propertyTypes = await this.importPropertyTypes.execute(
      batch.propertyTypes,
      context,
    );
    const roomTypes = await this.importRoomTypes.execute(
      batch.roomTypes,
      context,
    );
    const roles = await this.importRoles.execute(batch.roles);

    return {
      created: {
        users: users.created,
        properties: properties.created,
        rooms: rooms.created,
        propertyTypes: propertyTypes.created,
        roomTypes: roomTypes.created,
        roles: roles.created,
      },
      errors: [
        ...users.errors,
        ...properties.errors,
        ...rooms.errors,
        ...propertyTypes.errors,
        ...roomTypes.errors,
        ...roles.errors,
      ],
    };
  }
}
