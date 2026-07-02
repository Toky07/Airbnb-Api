import { NotFoundException } from '@nestjs/common';
import type { ICommandHandler } from '../../../../../shared/useCase/bus/command-handler.interface';
import type { IUserRepository } from '../../../domain/repositories/user.repository';
import { UserOutput } from '../../../domain/dtos/user.output';
import { validateUserFields } from '../../validation/validate-user-fields';
import type { SaveUserAvatarService } from '../../services/save-user-avatar.service';
import type { UpdateMyProfileCommand } from '../commands/UpdateMyProfileCommand';

export class UpdateMyProfileCommandHandler
  implements ICommandHandler<UpdateMyProfileCommand, UserOutput>
{
  constructor(
    private readonly repository: IUserRepository,
    private readonly saveUserAvatar: SaveUserAvatarService,
  ) {}

  async execute(command: UpdateMyProfileCommand): Promise<UserOutput> {
    const user = await this.repository.findByAuthId(command.authId);

    if (!user?.id) {
      throw new NotFoundException('Profil introuvable.');
    }

    validateUserFields({
      firstName: command.dto.firstName,
      lastName: command.dto.lastName,
      email: user.email,
      phoneNumber: command.dto.phoneNumber,
    });

    user.firstName = command.dto.firstName;
    user.lastName = command.dto.lastName;
    user.phoneNumber = command.dto.phoneNumber;
    user.avatar = await this.saveUserAvatar.resolve(user.id, user.avatar, {
      file: command.avatarFile,
      avatarFromDto: command.dto.avatar,
    });

    return UserOutput.fromDomain(await this.repository.update(user));
  }
}
