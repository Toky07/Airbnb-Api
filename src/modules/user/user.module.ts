import { Inject, Module, OnModuleInit, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../authentication/auth.module';
import { AUTH_REPOSITORY } from '../authentication/domain/repositories/auth.repository';
import type { IAuthRepository } from '../authentication/domain/repositories/auth.repository';
import { ROLE_REPOSITORY } from '../authentication/domain/repositories/role.repository';
import type { IRoleRepository } from '../authentication/domain/repositories/role.repository';
import { LOCAL_STORAGE_SERVICE } from '../media/services/localStorage.service';
import type { ILocalStorageService } from '../media/services/localStorage.service';
import { UserController } from './interfaces/http/user.controller';
import {
  USER_REPOSITORY,
  UserRepository,
} from './infrastructure/repositories/user.repository';
import type { IUserRepository } from './domain/repositories/user.repository';
import { cartUserProvider } from './infrastructure/adapters/cart-user.adapter';
import { UserEntity } from './infrastructure/entities/user.entity';
import { AuthEntity } from '../authentication/infrastructure/entity/auth.entity';
import { MediaModule } from '../media/media.module';
import { UserBootstrap } from './user.bootstrap';
import { CommandBus } from '../../shared/useCase/bus/bus';
import { QueryBus } from '../../shared/useCase/bus/query-bus';
import { CreateUserCommand } from './applications/useCase/commands/CreateUserCommand';
import { UpdateUserCommand } from './applications/useCase/commands/UpdateUserCommand';
import { DeleteUserCommand } from './applications/useCase/commands/DeleteUserCommand';
import { AssignUserRolesCommand } from './applications/useCase/commands/AssignUserRolesCommand';
import { RegisterHostCommand } from './applications/useCase/commands/RegisterHostCommand';
import { UpdateMyProfileCommand } from './applications/useCase/commands/UpdateMyProfileCommand';
import { FindUserQuery } from './applications/useCase/queries/FindUserQuery';
import { ListUsersQuery } from './applications/useCase/queries/ListUsersQuery';
import { ListUserOptionsQuery } from './applications/useCase/queries/ListUserOptionsQuery';
import { SetUserPasswordCommand } from './applications/useCase/commands/SetUserPasswordCommand';
import { UpdateUserStatusCommand } from './applications/useCase/commands/UpdateUserStatusCommand';
import { EnsureUserAuthAccountService } from './applications/services/ensure-user-auth-account.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, AuthEntity]),
    MediaModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [UserController],
  providers: [
    UserRepository,
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
    cartUserProvider,
    EnsureUserAuthAccountService,
  ],
  exports: [USER_REPOSITORY, cartUserProvider],
})
export class UserModule implements OnModuleInit {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
    @Inject(LOCAL_STORAGE_SERVICE)
    private readonly storage: ILocalStorageService,
    private readonly ensureUserAuthAccount: EnsureUserAuthAccountService,
  ) {}

  onModuleInit() {
    const bootstrap = UserBootstrap.create({
      userRepository: this.userRepository,
      authRepository: this.authRepository,
      roleRepository: this.roleRepository,
      storage: this.storage,
      ensureUserAuthAccount: this.ensureUserAuthAccount,
    });

    CommandBus.register(CreateUserCommand, bootstrap.createUserCommandHandler);
    CommandBus.register(UpdateUserCommand, bootstrap.updateUserCommandHandler);
    CommandBus.register(DeleteUserCommand, bootstrap.deleteUserCommandHandler);
    CommandBus.register(
      AssignUserRolesCommand,
      bootstrap.assignUserRolesCommandHandler,
    );
    CommandBus.register(
      RegisterHostCommand,
      bootstrap.registerHostCommandHandler,
    );
    CommandBus.register(
      UpdateMyProfileCommand,
      bootstrap.updateMyProfileCommandHandler,
    );
    CommandBus.register(
      SetUserPasswordCommand,
      bootstrap.setUserPasswordCommandHandler,
    );
    CommandBus.register(
      UpdateUserStatusCommand,
      bootstrap.updateUserStatusCommandHandler,
    );

    QueryBus.register(FindUserQuery, bootstrap.findUserQueryHandler);
    QueryBus.register(ListUsersQuery, bootstrap.listUsersQueryHandler);
    QueryBus.register(
      ListUserOptionsQuery,
      bootstrap.listUserOptionsQueryHandler,
    );
  }
}
