import type { ICommandHandler } from '../../../../../shared/useCase/bus/command-handler.interface';
import type { IAuthRepository } from '../../../../authentication/domain/repositories/auth.repository';
import type { IUserRepository } from '../../../domain/repositories/user.repository';
import type { SaveUserAvatarService } from '../../services/save-user-avatar.service';
import type { DeleteUserCommand } from '../commands/DeleteUserCommand';

export class DeleteUserCommandHandler
  implements ICommandHandler<DeleteUserCommand, boolean>
{
  constructor(
    private readonly repository: IUserRepository,
    private readonly authRepository: IAuthRepository,
    private readonly saveUserAvatar: SaveUserAvatarService,
  ) {}

  async execute(command: DeleteUserCommand): Promise<boolean> {
    const user = await this.repository.findById(command.id);

    if (user?.id) {
      await this.saveUserAvatar.deleteStored(user.avatar);
    }

    const authId =
      user?.authId ??
      (user ? (await this.authRepository.findByEmail(user.email))?.id : null) ??
      null;

    const deleted = await this.repository.delete(Number(command.id));

    if (deleted && authId != null) {
      await this.authRepository.delete(authId);
    }

    return deleted;
  }
}
