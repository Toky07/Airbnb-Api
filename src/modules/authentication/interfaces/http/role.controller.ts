import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { parsePaginationQuery } from '../../../../shared/pagination/parse-pagination-query';
import type { PaginatedResult } from '../../../../shared/pagination/pagination.types';
import { RoleOutput } from '../../applications/dto/role.output';
import { PermissionOutput } from '../../applications/dto/permission.output';
import { RequirePermissions } from '../decorators/require-permissions.decorator';
import { CommandBus } from '../../../../shared/useCase/bus/bus';
import { QueryBus } from '../../../../shared/useCase/bus/query-bus';
import { CreateRoleCommand } from '../../applications/useCase/commands/CreateRoleCommand';
import { UpdateRoleCommand } from '../../applications/useCase/commands/UpdateRoleCommand';
import { DeleteRoleCommand } from '../../applications/useCase/commands/DeleteRoleCommand';
import { SetRolePermissionsCommand } from '../../applications/useCase/commands/SetRolePermissionsCommand';
import { ListRolesQuery } from '../../applications/useCase/queries/ListRolesQuery';
import { ListPermissionsQuery } from '../../applications/useCase/queries/ListPermissionsQuery';
import {
  ApiJwtAuth,
  ApiPaginationQuery,
} from '../../../../shared/swagger/swagger.decorators';
import {
  CreateRoleSwaggerDto,
  SetRolePermissionsSwaggerDto,
  UpdateRoleSwaggerDto,
} from '../../../../shared/swagger/swagger-schemas.dto';
import { SWAGGER_TAGS } from '../../../../shared/swagger/swagger.constants';

@ApiTags(SWAGGER_TAGS.ROLES)
@ApiJwtAuth()
@Controller('auth')
export class RoleController {
  @Get('permissions')
  @RequirePermissions('roles.read')
  @ApiOperation({ summary: 'Lister toutes les permissions' })
  listPermissions(): Promise<PermissionOutput[]> {
    return QueryBus.execute(new ListPermissionsQuery());
  }

  @Get('roles')
  @RequirePermissions('roles.read')
  @ApiOperation({ summary: 'Lister les rôles (paginé)' })
  @ApiPaginationQuery()
  list(
    @Query() query: Record<string, unknown>,
  ): Promise<PaginatedResult<RoleOutput>> {
    return QueryBus.execute(new ListRolesQuery(parsePaginationQuery(query)));
  }

  @Post('roles')
  @RequirePermissions('roles.manage')
  @ApiOperation({ summary: 'Créer un rôle' })
  create(@Body() createRoleDto: CreateRoleSwaggerDto): Promise<RoleOutput> {
    return CommandBus.execute(new CreateRoleCommand(createRoleDto));
  }

  @Put('roles/:id')
  @RequirePermissions('roles.manage')
  @ApiOperation({ summary: 'Modifier un rôle' })
  update(
    @Param('id') id: number,
    @Body() updateRoleDto: UpdateRoleSwaggerDto,
  ): Promise<RoleOutput> {
    return CommandBus.execute(
      new UpdateRoleCommand({
        id: Number(id),
        name: updateRoleDto.name,
        description: updateRoleDto.description,
      }),
    );
  }

  @Put('roles/:id/permissions')
  @RequirePermissions('roles.manage')
  @ApiOperation({ summary: 'Définir les permissions d\'un rôle' })
  setPermissions(
    @Param('id') id: number,
    @Body() body: SetRolePermissionsSwaggerDto,
  ): Promise<RoleOutput> {
    return CommandBus.execute(
      new SetRolePermissionsCommand(Number(id), body.permissionKeys ?? []),
    );
  }

  @Delete('roles/:id')
  @RequirePermissions('roles.manage')
  @ApiOperation({ summary: 'Supprimer un rôle' })
  delete(@Param('id') id: number): Promise<boolean> {
    return CommandBus.execute(new DeleteRoleCommand(Number(id)));
  }
}
