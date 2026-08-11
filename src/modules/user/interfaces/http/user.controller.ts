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
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { parsePaginationQuery } from '@src/shared/pagination/parse-pagination-query';
import type { PaginatedResult } from '@src/shared/pagination/pagination.types';
import { UserOutput } from '@src/modules/user/domain/dtos/user.output';
import type {
  CreateUserDto,
  UpdateUserDto,
} from '@src/modules/user/domain/dtos/createUser.dto';
import type { AssignUserRolesDto } from '@src/modules/user/applications/dto/assign-user-roles.dto';
import { parseUserBody } from './parse-user-body';
import type { UploadFile } from '@src/modules/media/contracts';
import { RequirePermissions } from '@src/modules/authentication/contracts';
import { CommandBus } from '@src/shared/useCase/bus/bus';
import { QueryBus } from '@src/shared/useCase/bus/query-bus';
import { CreateUserCommand } from '@src/modules/user/applications/useCase/commands/CreateUserCommand';
import { UpdateUserCommand } from '@src/modules/user/applications/useCase/commands/UpdateUserCommand';
import { DeleteUserCommand } from '@src/modules/user/applications/useCase/commands/DeleteUserCommand';
import { AssignUserRolesCommand } from '@src/modules/user/applications/useCase/commands/AssignUserRolesCommand';
import { FindUserQuery } from '@src/modules/user/applications/useCase/queries/FindUserQuery';
import { ListUsersQuery } from '@src/modules/user/applications/useCase/queries/ListUsersQuery';
import { ListUserOptionsQuery } from '@src/modules/user/applications/useCase/queries/ListUserOptionsQuery';
import { SetUserPasswordCommand } from '@src/modules/user/applications/useCase/commands/SetUserPasswordCommand';
import { UpdateUserStatusCommand } from '@src/modules/user/applications/useCase/commands/UpdateUserStatusCommand';
import { parseSetUserPasswordBody } from '@src/modules/user/applications/dto/set-user-password.dto';
import { parseUpdateUserStatusBody } from '@src/modules/user/applications/dto/update-user-status.dto';
import {
  ApiJwtAuth,
  ApiPaginationQuery,
} from '@src/shared/swagger/swagger.decorators';
import { SWAGGER_TAGS } from '@src/shared/swagger/swagger.constants';

@ApiTags(SWAGGER_TAGS.USERS)
@ApiJwtAuth()
@Controller('users')
export class UserController {
  @Get('options')
  @RequirePermissions('users.read')
  @ApiOperation({ summary: 'Options utilisateurs pour formulaires' })
  async listOptions(): Promise<UserOutput[]> {
    return QueryBus.execute(new ListUserOptionsQuery());
  }

  @Get()
  @RequirePermissions('users.read')
  @ApiOperation({ summary: 'Liste paginée des utilisateurs' })
  @ApiPaginationQuery()
  async findAll(
    @Query() query: Record<string, unknown>,
  ): Promise<PaginatedResult<UserOutput>> {
    return QueryBus.execute(new ListUsersQuery(parsePaginationQuery(query)));
  }

  @Get(':id')
  @RequirePermissions('users.read')
  @ApiOperation({ summary: "Détail d'un utilisateur" })
  async findById(@Param('id') id: string): Promise<UserOutput> {
    return QueryBus.execute(new FindUserQuery(Number(id)));
  }

  @Post()
  @RequirePermissions('users.create')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Créer un utilisateur' })
  @UseInterceptors(FileInterceptor('avatar'))
  async create(
    @Body() body: CreateUserDto | Record<string, unknown>,
    @UploadedFile() avatar?: UploadFile,
  ): Promise<UserOutput> {
    const createUserDto =
      typeof (body as CreateUserDto).email === 'string'
        ? (body as CreateUserDto)
        : parseUserBody(body);
    return CommandBus.execute(new CreateUserCommand(createUserDto, avatar));
  }

  @Put(':id/password')
  @RequirePermissions('users.update')
  @ApiOperation({ summary: "Définir le mot de passe d'un utilisateur" })
  async setPassword(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ): Promise<UserOutput> {
    const { password } = parseSetUserPasswordBody(body);
    return CommandBus.execute(new SetUserPasswordCommand(Number(id), password));
  }

  @Put(':id/status')
  @RequirePermissions('users.update')
  @ApiOperation({ summary: "Modifier le statut d'un compte" })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ): Promise<UserOutput> {
    const { status } = parseUpdateUserStatusBody(body);
    return CommandBus.execute(new UpdateUserStatusCommand(Number(id), status));
  }

  @Put(':id/roles')
  @RequirePermissions('roles.manage')
  @ApiOperation({ summary: 'Assigner des rôles à un utilisateur' })
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
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Modifier un utilisateur' })
  @UseInterceptors(FileInterceptor('avatar'))
  async update(
    @Param('id') id: string,
    @Body() body: UpdateUserDto | Record<string, unknown>,
    @UploadedFile() avatar?: UploadFile,
  ): Promise<UserOutput> {
    const updateUserDto =
      typeof (body as UpdateUserDto).email === 'string'
        ? (body as UpdateUserDto)
        : parseUserBody(body);
    return CommandBus.execute(
      new UpdateUserCommand({ ...updateUserDto, id: Number(id) }, avatar),
    );
  }

  @Delete(':id')
  @RequirePermissions('users.delete')
  @ApiOperation({ summary: 'Supprimer un utilisateur' })
  async delete(@Param('id') id: string): Promise<void> {
    await CommandBus.execute(new DeleteUserCommand(Number(id)));
  }
}
