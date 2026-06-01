import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { type CreateRoleDto } from "../../application/dto/create-role.dto";
import { CreateRoleUseCase } from "../../useCase/create-role.usecase";
import { RoleOutput } from "../../application/dto/role.output";
import { ListRolesUseCase } from "../../useCase/list-role.usecase";
import type { UpdateRoleDto } from "../../application/dto/update-role.dto";
import { UpdateRoleUseCase } from "../../useCase/update-role.usecase";
import { DeleteRoleUseCase } from "../../useCase/delete-role.usecase";

@Controller('auth/roles')
export class RoleController {
  constructor(
    private readonly createRoleUseCase: CreateRoleUseCase,
    private readonly listRolesUseCase: ListRolesUseCase,
    private readonly updateRoleUseCase: UpdateRoleUseCase,
    private readonly deleteRoleUseCase: DeleteRoleUseCase,
  ) {}

  @Post()
  create(@Body() createRoleDto: CreateRoleDto): Promise<RoleOutput> {
    return this.createRoleUseCase.execute(createRoleDto);
  }

  @Get()
  list(): Promise<RoleOutput[]> {
    return this.listRolesUseCase.execute();
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() updateRoleDto: UpdateRoleDto): Promise<RoleOutput> {
    return this.updateRoleUseCase.execute({ id, name: updateRoleDto.name });
  }

  @Delete(':id')
  delete(@Param('id') id: number): Promise<boolean> {
    return this.deleteRoleUseCase.execute(id);
  }
}
