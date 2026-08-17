import { Auth } from '@src/modules/authentication/domain/entities/user.entity';
import { AuthEntity } from '@src/modules/authentication/infrastructure/entity/auth.entity';
import { EmailVO } from '@src/shared/valueObject/email.vo';
import { RoleMapper } from './role.mappers';
import type { AccountStatus } from '@src/modules/authentication/domain/constants/account-status.constant';

export class AuthMapper {
  static toDomain(auth: AuthEntity): Auth {
    const roles = (auth.roles ?? []).map((role) => RoleMapper.toDomain(role));
    return new Auth(
      auth.id,
      new EmailVO(auth.email),
      auth.password,
      roles,
      auth.status as AccountStatus,
      auth.updatedAt,
    );
  }

  static toEntity(auth: Auth) {
    return {
      email: auth.email,
      password: auth.password,
      status: auth.status,
    };
  }
}
