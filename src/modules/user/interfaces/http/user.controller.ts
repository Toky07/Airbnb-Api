import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { parsePaginationQuery } from '../../../../shared/pagination/parse-pagination-query';
import type { PaginatedResult } from '../../../../shared/pagination/pagination.types';
import { UserOutput } from '../../domain/dtos/user.output';
import type {
  CreateUserDto,
  UpdateUserDto,
} from '../../domain/dtos/createUser.dto';
import type { AssignUserRolesDto } from '../../application/dto/assign-user-roles.dto';
import { parseUserBody } from './parse-user-body';
import type { UploadFile } from '../../../media/types/upload-file';
import { RequirePermissions } from '../../../authentication/interfaces/decorators/require-permissions.decorator';
import { CommandBus } from '../../../../shared/useCase/bus/bus';
import { QueryBus } from '../../../../shared/useCase/bus/query-bus';
import { CreateUserCommand } from '../../application/useCase/commands/CreateUserCommand';
import { UpdateUserCommand } from '../../application/useCase/commands/UpdateUserCommand';
import { DeleteUserCommand } from '../../application/useCase/commands/DeleteUserCommand';
import { AssignUserRolesCommand } from '../../application/useCase/commands/AssignUserRolesCommand';
import { FindUserQuery } from '../../application/useCase/queries/FindUserQuery';
import { ListUsersQuery } from '../../application/useCase/queries/ListUsersQuery';
import { ListUserOptionsQuery } from '../../application/useCase/queries/ListUserOptionsQuery';

@Controller('users')
export class UserController {
  @Get('options')
  @RequirePermissions('users.read')
  async listOptions(): Promise<UserOutput[]> {
    return QueryBus.execute(new ListUserOptionsQuery());
  }

  @Get()
  @RequirePermissions('users.read')
  async findAll(
    @Query() query: Record<string, unknown>,
  ): Promise<PaginatedResult<UserOutput>> {
    return QueryBus.execute(new ListUsersQuery(parsePaginationQuery(query)));
  }

  @Get(':id')
  @RequirePermissions('users.read')
  async findById(@Param('id') id: string): Promise<UserOutput> {
    return QueryBus.execute(new FindUserQuery(Number(id)));
  }

  @Post()
  @RequirePermissions('users.create')
  @UseInterceptors(FileInterceptor('avatar'))
  async create(
    @Body() body: CreateUserDto | Record<string, unknown>,
    @UploadedFile() avatar?: UploadFile,
  ): Promise<UserOutput> {
    const createUserDto =
      typeof (body as CreateUserDto).email === 'string'
        ? (body as CreateUserDto)
        : parseUserBody(body as Record<string, unknown>);
    return CommandBus.execute(new CreateUserCommand(createUserDto, avatar));
  }

  @Put(':id/roles')
  @RequirePermissions('roles.manage')
  async assignRoles(
    @Param('id') id: string,
    @Body() body: AssignUserRolesDto,
  ): Promise<UserOutput> {
    return CommandBus.execute(
      new AssignUserRolesCommand(Number(id), body.roleIds ?? []),
    );
  }

  @Put(':id')
  @RequirePermissions('users.update')
  @UseInterceptors(FileInterceptor('avatar'))
  async update(
    @Param('id') id: string,
    @Body() body: UpdateUserDto | Record<string, unknown>,
    @UploadedFile() avatar?: UploadFile,
  ): Promise<UserOutput> {
    const updateUserDto =
      typeof (body as UpdateUserDto).email === 'string'
        ? (body as UpdateUserDto)
        : parseUserBody(body as Record<string, unknown>);
    return CommandBus.execute(
      new UpdateUserCommand({ ...updateUserDto, id: Number(id) }, avatar),
    );
  }

  @Delete(':id')
  @RequirePermissions('users.delete')
  async delete(@Param('id') id: string): Promise<void> {
    await CommandBus.execute(new DeleteUserCommand(Number(id)));
  }
}
