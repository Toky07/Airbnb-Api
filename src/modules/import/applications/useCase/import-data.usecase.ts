import { Injectable } from '@nestjs/common';
import type {
  ImportBatchDto,
  ImportBatchResult,
} from '../dto/import-batch.dto';
import { ImportBatchContextService } from '../services/import-batch-context.service';
import { ImportPropertiesUseCase } from './import-properties.usecase';
import { ImportPropertyTypesUseCase } from './import-property-types.usecase';
import { ImportRolesUseCase } from './import-roles.usecase';
import { ImportRoomTypesUseCase } from './import-room-types.usecase';
import { ImportRoomsUseCase } from './import-rooms.usecase';
import { ImportUsersUseCase } from './import-users.usecase';

@Injectable()
export class ImportDataUseCase {
  constructor(
    private readonly importBatchContext: ImportBatchContextService,
    private readonly importUsers: ImportUsersUseCase,
    private readonly importProperties: ImportPropertiesUseCase,
    private readonly importRooms: ImportRoomsUseCase,
    private readonly importPropertyTypes: ImportPropertyTypesUseCase,
    private readonly importRoomTypes: ImportRoomTypesUseCase,
    private readonly importRoles: ImportRolesUseCase,
  ) {}

  async execute(batch: ImportBatchDto): Promise<ImportBatchResult> {
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
