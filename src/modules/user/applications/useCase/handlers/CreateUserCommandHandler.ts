import type { ICommandHandler } from '../../../../../shared/useCase/bus/command-handler.interface';
import type { IUserRepository } from '../../../domain/repositories/user.repository';
import { User } from '../../../domain/entities/user.entity';
import { UserNameVO } from '../../../domain/valueObject/username.vo';
import { EmailVO } from '../../../../../shared/valueObject/email.vo';
import { PhoneNumberVO } from '../../../../../shared/valueObject/phone.vo';
import { UserOutput } from '../../../domain/dtos/user.output';
import { CommandBus } from '../../../../../shared/useCase/bus/bus';
import { SendAccountInvitationCommand } from '../../../../authentication/useCase/commands/SendAccountInvitationCommand';
import { ACCOUNT_STATUS } from '../../../../authentication/domain/constants/account-status.constant';
import { validateUserFields } from '../../validation/validate-user-fields';
import type { SaveUserAvatarService } from '../../services/save-user-avatar.service';
import type { CreateUserCommand } from '../commands/CreateUserCommand';

export class CreateUserCommandHandler implements ICommandHandler<
  CreateUserCommand,
  UserOutput
> {
  constructor(
    private readonly repository: IUserRepository,
    private readonly saveUserAvatar: SaveUserAvatarService,
  ) {}

  async execute(command: CreateUserCommand): Promise<UserOutput> {
    validateUserFields(command.dto);

    const user = new User(
      new UserNameVO(command.dto.firstName),
      new UserNameVO(command.dto.lastName),
      new EmailVO(command.dto.email),
      new PhoneNumberVO(command.dto.phoneNumber),
      '',
      undefined,
      undefined,
      undefined,
      undefined,
      [],
      false,
      ACCOUNT_STATUS.PENDING,
    );

    const created = await this.repository.create(user);
    const avatar = await this.saveUserAvatar.resolve(created.id!, '', {
      file: command.avatarFile,
      avatarFromDto: command.dto.avatar,
    });

    let saved = created;
    if (avatar !== created.avatar) {
      created.avatar = avatar;
      saved = await this.repository.update(created);
    }

    await CommandBus.execute(
      new SendAccountInvitationCommand({
        userId: saved.id!,
        sourceModule: 'admin-user-create',
      }),
    );

    return UserOutput.fromDomain(
      (await this.repository.findById(saved.id!)) ?? saved,
    );
  }
}
