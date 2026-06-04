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
import { ListUsersUseCase } from '../../application/useCase/listeUser.usecase';
import { ListUserOptionsUseCase } from '../../application/useCase/listUserOptions.usecase';
import { parsePaginationQuery } from '../../../../shared/pagination/parse-pagination-query';
import type { PaginatedResult } from '../../../../shared/pagination/pagination.types';
import { UserOutput } from '../../domain/dtos/user.output';
import type {
  CreateUserDto,
  UpdateUserDto,
} from '../../domain/dtos/createUser.dto';
import { CreateUserUseCase } from '../../application/useCase/createuser.usecase';
import { UpdateUserUseCase } from '../../application/useCase/updateUser.usecase';
import { DeleteUserUseCase } from '../../application/useCase/deleteUser.usecase';
import { FindUserUseCase } from '../../application/useCase/findUser.usecase';
import { AssignUserRolesUseCase } from '../../application/useCase/assignUserRoles.usecase';
import type { AssignUserRolesDto } from '../../application/dto/assign-user-roles.dto';
import { parseUserBody } from './parse-user-body';
import type { UploadFile } from '../../../media/types/upload-file';
import { RequirePermissions } from '../../../authentication/interfaces/decorators/require-permissions.decorator';

@Controller('users')
export class UserController {
  constructor(
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly listUserOptionsUseCase: ListUserOptionsUseCase,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    private readonly findUserUseCase: FindUserUseCase,
    private readonly assignUserRolesUseCase: AssignUserRolesUseCase,
  ) {}

  @Get('options')
  @RequirePermissions('users.read')
  async listOptions(): Promise<UserOutput[]> {
    return this.listUserOptionsUseCase.execute();
  }

  @Get()
  @RequirePermissions('users.read')
  async findAll(
    @Query() query: Record<string, unknown>,
  ): Promise<PaginatedResult<UserOutput>> {
    return this.listUsersUseCase.execute(parsePaginationQuery(query));
  }

  @Get(':id')
  @RequirePermissions('users.read')
  async findById(@Param('id') id: string): Promise<UserOutput> {
    return this.findUserUseCase.execute(Number(id)) as unknown as UserOutput;
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
    return this.createUserUseCase.execute(createUserDto, avatar);
  }

  @Put(':id/roles')
  @RequirePermissions('roles.manage')
  async assignRoles(
    @Param('id') id: string,
    @Body() body: AssignUserRolesDto,
  ): Promise<UserOutput> {
    return this.assignUserRolesUseCase.execute(
      Number(id),
      body.roleIds ?? [],
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
    return this.updateUserUseCase.execute(
      { ...updateUserDto, id: Number(id) },
      avatar,
    );
  }

  @Delete(':id')
  @RequirePermissions('users.delete')
  async delete(@Param('id') id: string): Promise<void> {
    await this.deleteUserUseCase.execute(Number(id));
  }
}
