import type { ICommandHandler } from '@src/shared/useCase/bus/command-handler.interface';
import { ResolveAuthenticatedUserService } from '@src/shared/auth/resolve-authenticated-user.service';
import type { IUserRepository } from '@src/modules/user/domain/repositories/user.repository';
import { UserOutput } from '@src/modules/user/domain/dtos/user.output';
import { validateUserFields } from '@src/modules/user/applications/validation/validate-user-fields';
import type { SaveUserAvatarService } from '@src/modules/user/applications/services/save-user-avatar.service';
import type { UpdateMyProfileCommand } from '@src/modules/user/applications/useCase/commands/UpdateMyProfileCommand';

export class UpdateMyProfileCommandHandler implements ICommandHandler<
  UpdateMyProfileCommand,
  UserOutput
> {
  private readonly resolveAuthenticatedUser: ResolveAuthenticatedUserService;

  constructor(
    private readonly repository: IUserRepository,
    private readonly saveUserAvatar: SaveUserAvatarService,
  ) {
    this.resolveAuthenticatedUser = new ResolveAuthenticatedUserService(
      repository,
    );
  }

  async execute(command: UpdateMyProfileCommand): Promise<UserOutput> {
    const user = await this.resolveAuthenticatedUser.resolveUser(
      command.authId,
      { failure: 'not-found', message: 'Profil introuvable.' },
    );

    validateUserFields({
      firstName: command.dto.firstName,
      lastName: command.dto.lastName,
      email: user.email,
      phoneNumber: command.dto.phoneNumber,
    });

    user.firstName = command.dto.firstName;
    user.lastName = command.dto.lastName;
    user.phoneNumber = command.dto.phoneNumber;
    user.avatar = await this.saveUserAvatar.resolve(user.id!, user.avatar, {
      file: command.avatarFile,
      avatarFromDto: command.dto.avatar,
    });

    return UserOutput.fromDomain(await this.repository.update(user));
  }
}
