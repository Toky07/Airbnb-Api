import type { ICommandHandler } from '@src/shared/useCase/bus/command-handler.interface';
import type { IAuthRepository } from '@src/modules/authentication/domain/repositories/auth.repository';
import { EmailVO } from '@src/shared/valueObject/email.vo';
import { Auth } from '@src/modules/authentication/domain/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { ACCOUNT_STATUS } from '@src/modules/authentication/domain/constants/account-status.constant';
import type { CreateCredentialsCommand } from '@src/modules/authentication/applications/useCase/commands/CreateCredentialsCommand';

export class CreateCredentialsCommandHandler implements ICommandHandler<
  CreateCredentialsCommand,
  boolean
> {
  constructor(private readonly repository: IAuthRepository) {}

  async execute(command: CreateCredentialsCommand): Promise<boolean> {
    const password = await bcrypt.hash(command.password, 10);
    const created = await this.repository.create(
      new Auth(
        undefined,
        new EmailVO(command.email),
        password,
        [],
        ACCOUNT_STATUS.ACTIVE,
      ),
    );

    if (!created) {
      return false;
    }

    return created;
  }
}
