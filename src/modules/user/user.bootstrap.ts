import type { IAuthRepository } from '@src/modules/authentication/contracts';
import type { IRoleRepository } from '@src/modules/authentication/contracts';
import type { ILocalStorageService } from '@src/modules/media/contracts';
import type { IUserRepository } from './domain/repositories/user.repository';
import { SaveUserAvatarService } from './applications/services/save-user-avatar.service';
import { CreateUserCommandHandler } from './applications/useCase/handlers/CreateUserCommandHandler';
import { UpdateUserCommandHandler } from './applications/useCase/handlers/UpdateUserCommandHandler';
import { DeleteUserCommandHandler } from './applications/useCase/handlers/DeleteUserCommandHandler';
import { AssignUserRolesCommandHandler } from './applications/useCase/handlers/AssignUserRolesCommandHandler';
import { RegisterHostCommandHandler } from './applications/useCase/handlers/RegisterHostCommandHandler';
import { UpdateMyProfileCommandHandler } from './applications/useCase/handlers/UpdateMyProfileCommandHandler';
import { FindUserQueryHandler } from './applications/useCase/handlers/FindUserQueryHandler';
import { ListUsersQueryHandler } from './applications/useCase/handlers/ListUsersQueryHandler';
import { ListUserOptionsQueryHandler } from './applications/useCase/handlers/ListUserOptionsQueryHandler';
import { SetUserPasswordCommandHandler } from './applications/useCase/handlers/SetUserPasswordCommandHandler';
import { UpdateUserStatusCommandHandler } from './applications/useCase/handlers/UpdateUserStatusCommandHandler';
import type { EnsureUserAuthAccountService } from './applications/services/ensure-user-auth-account.service';

export class UserBootstrap {
  static create(deps: {
    userRepository: IUserRepository;
    authRepository: IAuthRepository;
    roleRepository: IRoleRepository;
    storage: ILocalStorageService;
    ensureUserAuthAccount: EnsureUserAuthAccountService;
  }) {
    const saveUserAvatar = new SaveUserAvatarService(deps.storage);

    return {
      saveUserAvatar,
      createUserCommandHandler: new CreateUserCommandHandler(
        deps.userRepository,
        saveUserAvatar,
      ),
      updateUserCommandHandler: new UpdateUserCommandHandler(
        deps.userRepository,
        saveUserAvatar,
      ),
      deleteUserCommandHandler: new DeleteUserCommandHandler(
        deps.userRepository,
        deps.authRepository,
        saveUserAvatar,
      ),
      assignUserRolesCommandHandler: new AssignUserRolesCommandHandler(
        deps.userRepository,
        deps.authRepository,
      ),
      registerHostCommandHandler: new RegisterHostCommandHandler(
        deps.authRepository,
        deps.roleRepository,
        deps.userRepository,
      ),
      updateMyProfileCommandHandler: new UpdateMyProfileCommandHandler(
        deps.userRepository,
        saveUserAvatar,
      ),
      findUserQueryHandler: new FindUserQueryHandler(deps.userRepository),
      listUsersQueryHandler: new ListUsersQueryHandler(deps.userRepository),
      listUserOptionsQueryHandler: new ListUserOptionsQueryHandler(
        deps.userRepository,
      ),
      setUserPasswordCommandHandler: new SetUserPasswordCommandHandler(
        deps.userRepository,
        deps.authRepository,
        deps.ensureUserAuthAccount,
      ),
      updateUserStatusCommandHandler: new UpdateUserStatusCommandHandler(
        deps.userRepository,
        deps.authRepository,
        deps.ensureUserAuthAccount,
      ),
    };
  }
}
