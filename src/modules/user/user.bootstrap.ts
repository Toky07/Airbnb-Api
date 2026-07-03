import type { IAuthRepository } from '../authentication/domain/repositories/auth.repository';
import type { IRoleRepository } from '../authentication/domain/repositories/role.repository';
import type { ILocalStorageService } from '../media/services/localStorage.service';
import type { IUserRepository } from './domain/repositories/user.repository';
import { SaveUserAvatarService } from './application/services/save-user-avatar.service';
import { CreateUserCommandHandler } from './application/useCase/handlers/CreateUserCommandHandler';
import { UpdateUserCommandHandler } from './application/useCase/handlers/UpdateUserCommandHandler';
import { DeleteUserCommandHandler } from './application/useCase/handlers/DeleteUserCommandHandler';
import { AssignUserRolesCommandHandler } from './application/useCase/handlers/AssignUserRolesCommandHandler';
import { RegisterHostCommandHandler } from './application/useCase/handlers/RegisterHostCommandHandler';
import { UpdateMyProfileCommandHandler } from './application/useCase/handlers/UpdateMyProfileCommandHandler';
import { FindUserQueryHandler } from './application/useCase/handlers/FindUserQueryHandler';
import { ListUsersQueryHandler } from './application/useCase/handlers/ListUsersQueryHandler';
import { ListUserOptionsQueryHandler } from './application/useCase/handlers/ListUserOptionsQueryHandler';

export class UserBootstrap {
  static create(deps: {
    userRepository: IUserRepository;
    authRepository: IAuthRepository;
    roleRepository: IRoleRepository;
    storage: ILocalStorageService;
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
    };
  }
}
