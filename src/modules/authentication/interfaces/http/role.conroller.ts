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
import { parsePaginationQuery } from '../../../../shared/pagination/parse-pagination-query';
import type { PaginatedResult } from '../../../../shared/pagination/pagination.types';
import { type CreateRoleDto } from '../../application/dto/create-role.dto';
import { RoleOutput } from '../../application/dto/role.output';
import type { UpdateRoleDto } from '../../application/dto/update-role.dto';
import { PermissionOutput } from '../../application/dto/permission.output';
import type { SetRolePermissionsDto } from '../../application/dto/set-role-permissions.dto';
import { RequirePermissions } from '../decorators/require-permissions.decorator';
import { CommandBus } from '../../../../shared/useCase/bus/bus';
import { QueryBus } from '../../../../shared/useCase/bus/query-bus';
import { CreateRoleCommand } from '../../useCase/commands/CreateRoleCommand';
import { UpdateRoleCommand } from '../../useCase/commands/UpdateRoleCommand';
import { DeleteRoleCommand } from '../../useCase/commands/DeleteRoleCommand';
import { SetRolePermissionsCommand } from '../../useCase/commands/SetRolePermissionsCommand';
import { ListRolesQuery } from '../../useCase/queries/ListRolesQuery';
import { ListPermissionsQuery } from '../../useCase/queries/ListPermissionsQuery';

@Controller('auth')
export class RoleController {
  @Get('permissions')
  @RequirePermissions('roles.read')
  listPermissions(): Promise<PermissionOutput[]> {
    return QueryBus.execute(new ListPermissionsQuery());
  }

  @Get('roles')
  @RequirePermissions('roles.read')
  list(
    @Query() query: Record<string, unknown>,
  ): Promise<PaginatedResult<RoleOutput>> {
    return QueryBus.execute(new ListRolesQuery(parsePaginationQuery(query)));
  }

  @Post('roles')
  @RequirePermissions('roles.manage')
  create(@Body() createRoleDto: CreateRoleDto): Promise<RoleOutput> {
    return CommandBus.execute(new CreateRoleCommand(createRoleDto));
  }

  @Put('roles/:id')
  @RequirePermissions('roles.manage')
  update(
    @Param('id') id: number,
    @Body() updateRoleDto: UpdateRoleDto,
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
  setPermissions(
    @Param('id') id: number,
    @Body() body: SetRolePermissionsDto,
  ): Promise<RoleOutput> {
    return CommandBus.execute(
      new SetRolePermissionsCommand(Number(id), body.permissionKeys ?? []),
    );
  }

  @Delete('roles/:id')
  @RequirePermissions('roles.manage')
  delete(@Param('id') id: number): Promise<boolean> {
    return CommandBus.execute(new DeleteRoleCommand(Number(id)));
  }
}
