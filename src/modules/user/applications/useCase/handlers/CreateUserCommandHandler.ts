import type { ICommandHandler } from '@src/shared/useCase/bus/command-handler.interface';
import type { IUserRepository } from '@src/modules/user/domain/repositories/user.repository';
import { User } from '@src/modules/user/domain/entities/user.entity';
import { UserNameVO } from '@src/modules/user/domain/valueObject/username.vo';
import { EmailVO } from '@src/shared/valueObject/email.vo';
import { PhoneNumberVO } from '@src/shared/valueObject/phone.vo';
import { UserOutput } from '@src/modules/user/domain/dtos/user.output';
import { CommandBus } from '@src/shared/useCase/bus/bus';
import { SendAccountInvitationCommand } from '@src/modules/authentication/contracts';
import { ACCOUNT_STATUS } from '@src/modules/authentication/contracts';
import { validateUserFields } from '@src/modules/user/applications/validation/validate-user-fields';
import type { SaveUserAvatarService } from '@src/modules/user/applications/services/save-user-avatar.service';
import type { CreateUserCommand } from '@src/modules/user/applications/useCase/commands/CreateUserCommand';

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
