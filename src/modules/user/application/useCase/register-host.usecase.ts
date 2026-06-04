import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { AUTH_REPOSITORY } from '../../../authentication/domain/repositories/auth.repository';
import type { IAuthRepository } from '../../../authentication/domain/repositories/auth.repository';
import { ROLE_REPOSITORY } from '../../../authentication/domain/repositories/role.repository';
import type { IRoleRepository } from '../../../authentication/domain/repositories/role.repository';
import { USER_REPOSITORY } from '../../infrastructure/repositories/user.repository';
import type { IUserRepository } from '../../domain/repositories/user.repository';
import { EmailVO } from '../../../../shared/valueObject/email.vo';
import { Auth } from '../../../authentication/domain/entities/user.entity';
import { HOST_ROLE_SLUG } from '../../../authentication/domain/constants/permissions.constant';
import { User } from '../../domain/entities/user.entity';
import { UserNameVO } from '../../domain/valueObject/username.vo';
import { PhoneNumberVO } from '../../../../shared/valueObject/phone.vo';
import * as bcrypt from 'bcrypt';

export type RegisterHostDto = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
};

@Injectable()
export class RegisterHostUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY) private readonly authRepository: IAuthRepository,
    @Inject(ROLE_REPOSITORY) private readonly roleRepository: IRoleRepository,
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
  ) {}

  async execute(dto: RegisterHostDto): Promise<boolean> {
    const email = dto.email.trim().toLowerCase();
    const password = dto.password?.trim();
    const firstName = dto.firstName?.trim();
    const lastName = dto.lastName?.trim();
    const phoneNumber = dto.phoneNumber?.trim();

    if (!email || !password || !firstName || !lastName || !phoneNumber) {
      throw new BadRequestException('Tous les champs sont obligatoires.');
    }

    const existingAuth = await this.authRepository.findByEmail(email);
    if (existingAuth) {
      throw new BadRequestException('Cet email est déjà utilisé.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const created = await this.authRepository.create(
      new Auth(undefined, new EmailVO(email), hashedPassword),
    );

    if (!created) {
      return false;
    }

    const auth = await this.authRepository.findByEmail(email);
    if (!auth?.id) {
      return created;
    }

    const hostRole = await this.roleRepository.findBySlug(HOST_ROLE_SLUG);
    if (hostRole?.id) {
      await this.authRepository.assignRoles(auth.id, [hostRole.id]);
    }

    const user = new User(
      new UserNameVO(firstName),
      new UserNameVO(lastName),
      new EmailVO(email),
      new PhoneNumberVO(phoneNumber),
      '',
      undefined,
      undefined,
      undefined,
      auth.id,
    );

    await this.userRepository.create(user);
    return true;
  }
}
