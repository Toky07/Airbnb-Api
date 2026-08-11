import { NotFoundException } from '@nestjs/common';
import type { ICommandHandler } from '@src/shared/useCase/bus/command-handler.interface';
import type { IUserRepository } from '@src/modules/user/domain/repositories/user.repository';
import { UserOutput } from '@src/modules/user/domain/dtos/user.output';
import { validateUserFields } from '@src/modules/user/applications/validation/validate-user-fields';
import type { SaveUserAvatarService } from '@src/modules/user/applications/services/save-user-avatar.service';
import type { UpdateUserCommand } from '@src/modules/user/applications/useCase/commands/UpdateUserCommand';

export class UpdateUserCommandHandler implements ICommandHandler<
  UpdateUserCommand,
  UserOutput
> {
  constructor(
    private readonly repository: IUserRepository,
    private readonly saveUserAvatar: SaveUserAvatarService,
  ) {}

  async execute(command: UpdateUserCommand): Promise<UserOutput> {
    const user = await this.repository.findById(command.dto.id);

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable.');
    }

    validateUserFields(command.dto);

    user.firstName = command.dto.firstName;
    user.lastName = command.dto.lastName;
    user.email = command.dto.email;
    user.phoneNumber = command.dto.phoneNumber;
    user.avatar = await this.saveUserAvatar.resolve(user.id!, user.avatar, {
      file: command.avatarFile,
      avatarFromDto: command.dto.avatar,
    });

    return UserOutput.fromDomain(await this.repository.update(user));
  }
}
