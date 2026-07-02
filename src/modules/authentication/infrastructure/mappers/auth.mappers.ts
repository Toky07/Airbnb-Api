import { Auth } from '../../domain/entities/user.entity';
import { AuthEntity } from '../entity/auth.entity';
import { EmailVO } from '../../../../shared/valueObject/email.vo';
import { RoleMapper } from './role.mappers';
import type { AccountStatus } from '../../domain/constants/account-status.constant';

export class AuthMapper {
  static toDomain(auth: AuthEntity): Auth {
    const roles = (auth.roles ?? []).map((role) => RoleMapper.toDomain(role));
    return new Auth(
      auth.id,
      new EmailVO(auth.email),
      auth.password,
      roles,
      auth.status as AccountStatus,
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
