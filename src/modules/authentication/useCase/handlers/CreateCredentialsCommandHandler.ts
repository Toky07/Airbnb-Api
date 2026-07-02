import type { ICommandHandler } from '../../../../shared/useCase/bus/command-handler.interface';
import type { IAuthRepository } from '../../domain/repositories/auth.repository';
import { EmailVO } from '../../../../shared/valueObject/email.vo';
import { Auth } from '../../domain/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { ACCOUNT_STATUS } from '../../domain/constants/account-status.constant';
import type { CreateCredentialsCommand } from '../commands/CreateCredentialsCommand';

export class CreateCredentialsCommandHandler
  implements ICommandHandler<CreateCredentialsCommand, boolean>
{
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
