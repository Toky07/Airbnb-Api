import { Inject, Injectable } from '@nestjs/common';
import { AUTH_REPOSITORY } from '../domain/repositories/auth.repository';
import type { IAuthRepository } from '../domain/repositories/auth.repository';
import { EmailVO } from '../../../shared/valueObject/email.vo';
import { Auth } from '../domain/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { ACCOUNT_STATUS } from '../../account-activation/domain/constants/account-status.constant';

@Injectable()
export class CreateCredentialsUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY) private readonly repository: IAuthRepository,
  ) {}

  async execute(credentials: {
    email: string;
    password: string;
  }): Promise<boolean> {
    const password = await bcrypt.hash(credentials.password, 10);
    const created = await this.repository.create(
      new Auth(
        undefined,
        new EmailVO(credentials.email),
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
