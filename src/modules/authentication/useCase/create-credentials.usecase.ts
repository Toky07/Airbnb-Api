import { Inject, Injectable } from '@nestjs/common';
import { AUTH_REPOSITORY } from '../domain/repositories/auth.repository';
import type { IAuthRepository } from '../domain/repositories/auth.repository';
import { ROLE_REPOSITORY } from '../domain/repositories/role.repository';
import type { IRoleRepository } from '../domain/repositories/role.repository';
import { EmailVO } from '../../../shared/valueObject/email.vo';
import { Auth } from '../domain/entities/user.entity';
import { SUPERADMIN_ROLE_SLUG } from '../domain/constants/permissions.constant';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CreateCredentialsUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY) private readonly repository: IAuthRepository,
    @Inject(ROLE_REPOSITORY) private readonly roleRepository: IRoleRepository,
  ) {}

  async execute(credentials: {
    email: string;
    password: string;
  }): Promise<boolean> {
    const password = await bcrypt.hash(credentials.password, 10);
    const created = await this.repository.create(
      new Auth(undefined, new EmailVO(credentials.email), password),
    );

    if (!created) {
      return false;
    }

    const auth = await this.repository.findByEmail(credentials.email);
    if (!auth?.id) {
      return created;
    }

    const superAdmin = await this.roleRepository.findBySlug(
      SUPERADMIN_ROLE_SLUG,
    );

    if (superAdmin?.id) {
      await this.repository.assignRoles(auth.id, [superAdmin.id]);
    }

    return created;
  }
}
