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
import { parsePaginationQuery } from '@src/shared/pagination/parse-pagination-query';
import type { PaginatedResult } from '@src/shared/pagination/pagination.types';
import { RoleOutput } from '@src/modules/authentication/applications/dto/role.output';
import { PermissionOutput } from '@src/modules/authentication/applications/dto/permission.output';
import { RequirePermissions } from '@src/modules/authentication/interfaces/decorators/require-permissions.decorator';
import { CommandBus } from '@src/shared/useCase/bus/bus';
import { QueryBus } from '@src/shared/useCase/bus/query-bus';
import { CreateRoleCommand } from '@src/modules/authentication/applications/useCase/commands/CreateRoleCommand';
import { UpdateRoleCommand } from '@src/modules/authentication/applications/useCase/commands/UpdateRoleCommand';
import { DeleteRoleCommand } from '@src/modules/authentication/applications/useCase/commands/DeleteRoleCommand';
import { SetRolePermissionsCommand } from '@src/modules/authentication/applications/useCase/commands/SetRolePermissionsCommand';
import { ListRolesQuery } from '@src/modules/authentication/applications/useCase/queries/ListRolesQuery';
import { ListPermissionsQuery } from '@src/modules/authentication/applications/useCase/queries/ListPermissionsQuery';
import {
  ApiJwtAuth,
  ApiPaginationQuery,
} from '@src/shared/swagger/swagger.decorators';
import { CreateRoleSwaggerDto } from '@src/shared/swagger/create-role-swagger.dto';
import { SetRolePermissionsSwaggerDto } from '@src/shared/swagger/set-role-permissions-swagger.dto';
import { UpdateRoleSwaggerDto } from '@src/shared/swagger/update-role-swagger.dto';
import { SWAGGER_TAGS } from '@src/shared/swagger/swagger.constants';

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
  @ApiOperation({ summary: "Définir les permissions d'un rôle" })
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
