import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IUserRepository } from '../../domain/repositories/user.repository';
import { USER_REPOSITORY } from '../../infrastructure/repositories/user.repository';
import { UserOutput } from '../../domain/dtos/user.output';
import type { UploadFile } from '../../../media/types/upload-file';
import { SaveUserAvatarUseCase } from './saveUserAvatar.usecase';
import { validateUserFields } from '../validation/validate-user-fields';
import type { UpdateMyProfileDto } from '../dto/update-my-profile.dto';

@Injectable()
export class UpdateMyProfileUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly repository: IUserRepository,
    private readonly saveUserAvatar: SaveUserAvatarUseCase,
  ) {}

  async execute(
    authId: number,
    dto: UpdateMyProfileDto,
    avatarFile?: UploadFile,
  ): Promise<UserOutput> {
    const user = await this.repository.findByAuthId(authId);

    if (!user?.id) {
      throw new NotFoundException('Profil introuvable.');
    }

    validateUserFields({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: user.email,
      phoneNumber: dto.phoneNumber,
    });

    user.firstName = dto.firstName;
    user.lastName = dto.lastName;
    user.phoneNumber = dto.phoneNumber;
    user.avatar = await this.saveUserAvatar.resolve(user.id, user.avatar, {
      file: avatarFile,
      avatarFromDto: dto.avatar,
    });

    return UserOutput.fromDomain(await this.repository.update(user));
  }
}
