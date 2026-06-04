import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { EmailVO } from '../../../../shared/valueObject/email.vo';
import { AUTH_REPOSITORY } from '../../../authentication/domain/repositories/auth.repository';
import type { IAuthRepository } from '../../../authentication/domain/repositories/auth.repository';
import { Auth } from '../../../authentication/domain/entities/user.entity';
import { UserOutput } from '../../domain/dtos/user.output';
import { USER_REPOSITORY } from '../../infrastructure/repositories/user.repository';
import type { IUserRepository } from '../../domain/repositories/user.repository';

@Injectable()
export class AssignUserRolesUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(AUTH_REPOSITORY) private readonly authRepository: IAuthRepository,
  ) {}

  async execute(
    userId: number,
    roleIds: number[],
    password?: string,
  ): Promise<UserOutput> {
    const user = await this.userRepository.findById(userId);

    if (!user?.id) {
      throw new NotFoundException('User not found');
    }

    let auth =
      user.authId != null
        ? await this.authRepository.findById(user.authId)
        : await this.authRepository.findByEmail(user.email);

    if (!auth?.id) {
      const trimmedPassword = password?.trim();
      if (!trimmedPassword) {
        throw new BadRequestException(
          'Aucun compte de connexion pour cet utilisateur. Indiquez un mot de passe pour le créer.',
        );
      }

      const created = await this.authRepository.create(
        new Auth(undefined, new EmailVO(user.email), await bcrypt.hash(trimmedPassword, 10)),
      );

      if (!created) {
        throw new BadRequestException(
          'Impossible de créer le compte de connexion (email peut-être déjà utilisé).',
        );
      }

      auth = await this.authRepository.findByEmail(user.email);

      if (!auth?.id) {
        throw new BadRequestException('Compte de connexion introuvable après création.');
      }

      await this.userRepository.linkAuthAccount(userId, auth.id);
    } else if (user.authId == null) {
      await this.userRepository.linkAuthAccount(userId, auth.id);
    }

    await this.authRepository.assignRoles(auth.id, roleIds);

    const updated = await this.userRepository.findById(userId);
    if (!updated) {
      throw new NotFoundException('User not found');
    }

    return UserOutput.fromDomain(updated);
  }
}
