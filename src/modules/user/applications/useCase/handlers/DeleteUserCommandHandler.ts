import { ForbiddenException } from '@nestjs/common';
import type { ICommandHandler } from '@src/shared/useCase/bus/command-handler.interface';
import {
  SUPERADMIN_ROLE_SLUG,
  type IAuthRepository,
} from '@src/modules/authentication/contracts';
import type { IUserRepository } from '@src/modules/user/domain/repositories/user.repository';
import type { SaveUserAvatarService } from '@src/modules/user/applications/services/save-user-avatar.service';
import type { DeleteUserCommand } from '@src/modules/user/applications/useCase/commands/DeleteUserCommand';

export class DeleteUserCommandHandler implements ICommandHandler<
  DeleteUserCommand,
  boolean
> {
  constructor(
    private readonly repository: IUserRepository,
    private readonly authRepository: IAuthRepository,
    private readonly saveUserAvatar: SaveUserAvatarService,
  ) {}

  async execute(command: DeleteUserCommand): Promise<boolean> {
    const user = await this.repository.findById(command.id);

    const authId =
      user?.authId ??
      (user ? (await this.authRepository.findByEmail(user.email))?.id : null) ??
      null;

    if (authId != null) {
      const auth = await this.authRepository.findById(authId);
      const isSuperAdmin = Boolean(
        auth?.roles?.some((role) => role.slug === SUPERADMIN_ROLE_SLUG),
      );
      if (isSuperAdmin) {
        const remaining =
          await this.authRepository.countWithRoleSlug(SUPERADMIN_ROLE_SLUG);
        if (remaining <= 1) {
          throw new ForbiddenException(
            'Impossible de supprimer le dernier super administrateur.',
          );
        }
      }
    }

    if (user?.id) {
      await this.saveUserAvatar.deleteStored(user.avatar);
    }

    const deleted = await this.repository.delete(Number(command.id));

    if (deleted && authId != null) {
      await this.authRepository.delete(authId);
    }

    return deleted;
  }
}
