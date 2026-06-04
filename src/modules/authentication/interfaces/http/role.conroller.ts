import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { type CreateRoleDto } from '../../application/dto/create-role.dto';
import { CreateRoleUseCase } from '../../useCase/create-role.usecase';
import { RoleOutput } from '../../application/dto/role.output';
import { ListRolesUseCase } from '../../useCase/list-role.usecase';
import type { UpdateRoleDto } from '../../application/dto/update-role.dto';
import { UpdateRoleUseCase } from '../../useCase/update-role.usecase';
import { DeleteRoleUseCase } from '../../useCase/delete-role.usecase';
import { ListPermissionsUseCase } from '../../useCase/list-permissions.usecase';
import { PermissionOutput } from '../../application/dto/permission.output';
import { SetRolePermissionsUseCase } from '../../useCase/set-role-permissions.usecase';
import type { SetRolePermissionsDto } from '../../application/dto/set-role-permissions.dto';
import { RequirePermissions } from '../decorators/require-permissions.decorator';

@Controller('auth')
export class RoleController {
  constructor(
    private readonly createRoleUseCase: CreateRoleUseCase,
    private readonly listRolesUseCase: ListRolesUseCase,
    private readonly updateRoleUseCase: UpdateRoleUseCase,
    private readonly deleteRoleUseCase: DeleteRoleUseCase,
    private readonly listPermissionsUseCase: ListPermissionsUseCase,
    private readonly setRolePermissionsUseCase: SetRolePermissionsUseCase,
  ) {}

  @Get('permissions')
  @RequirePermissions('roles.read')
  listPermissions(): PermissionOutput[] {
    return this.listPermissionsUseCase.execute();
  }

  @Get('roles')
  @RequirePermissions('roles.read')
  list(): Promise<RoleOutput[]> {
    return this.listRolesUseCase.execute();
  }

  @Post('roles')
  @RequirePermissions('roles.manage')
  create(@Body() createRoleDto: CreateRoleDto): Promise<RoleOutput> {
    return this.createRoleUseCase.execute(createRoleDto);
  }

  @Put('roles/:id')
  @RequirePermissions('roles.manage')
  update(
    @Param('id') id: number,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<RoleOutput> {
    return this.updateRoleUseCase.execute({
      id: Number(id),
      name: updateRoleDto.name,
      description: updateRoleDto.description,
    });
  }

  @Put('roles/:id/permissions')
  @RequirePermissions('roles.manage')
  setPermissions(
    @Param('id') id: number,
    @Body() body: SetRolePermissionsDto,
  ): Promise<RoleOutput> {
    return this.setRolePermissionsUseCase.execute(
      Number(id),
      body.permissionKeys ?? [],
    );
  }

  @Delete('roles/:id')
  @RequirePermissions('roles.manage')
  delete(@Param('id') id: number): Promise<boolean> {
    return this.deleteRoleUseCase.execute(Number(id));
  }
}
